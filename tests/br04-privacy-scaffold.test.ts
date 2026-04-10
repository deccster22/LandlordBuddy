import test from "node:test";
import assert from "node:assert/strict";

import {
  createForumPathState,
  createOfficialHandoffStateRecord,
  createOutputModeState,
  type Matter,
  type NoticeDraft,
  type OutputPackage
} from "../src/domain/model.js";
import { createEvidenceItemShell } from "../src/modules/evidence/index.js";
import {
  br04QaInventoryHooks,
  buildBr04PrivacyHooks,
  createAccessScope,
  createDataClass,
  createDeidentificationAction,
  createDeletionRequest,
  createHoldReason,
  createPreservationScope,
  createPrivacyAuditEvent,
  createPrivacyRoleBoundary,
  createRetentionPolicyRef,
  createScopedHoldFlag
} from "../src/modules/br04/index.js";

test("br04 privacy hooks attach cleanly to matter, evidence, and document records", () => {
  const dataClass = createDataClass({
    id: "class-1",
    code: "MATTER_PRIMARY_RECORD",
    label: "Matter primary record",
    appliesTo: "MATTER",
    sensitivity: "PERSONAL",
    summary: "Primary matter-level privacy classification placeholder."
  });
  const policyRef = createRetentionPolicyRef({
    id: "policy-1",
    policyKey: "MATTER_PRIMARY_RECORD",
    dataClassId: dataClass.id,
    appliesTo: "MATTER",
    notes: ["Retention duration remains configurable and guarded."]
  });
  const matter: Matter = {
    id: "matter-1",
    tenancyId: "tenancy-1",
    propertyId: "property-1",
    status: "NOTICE_PREPARATION",
    workflowState: "NOTICE_DRAFTING_READY",
    forumPath: createForumPathState({ path: "VIC_VCAT_RENT_ARREARS" }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    arrearsStatus: {
      asAt: "2026-04-11T09:00:00.000Z",
      outstandingAmount: { amountMinor: 220000, currency: "AUD" },
      overdueChargeIds: ["charge-1"],
      unappliedPaymentIds: [],
      calculationConfidence: "DETERMINISTIC",
      warnings: []
    },
    priorNoticeIds: [],
    evidenceItemIds: ["evidence-1"],
    paymentPlanIds: [],
    referralFlagIds: [],
    routingDecisionIds: [],
    auditLogIds: [],
    privacyHooks: buildBr04PrivacyHooks({
      dataClassIds: [dataClass.id],
      retentionPolicyRefs: [policyRef],
      accessScopeIds: ["scope-1"]
    }),
    sourceReferenceIds: []
  };
  const evidence = createEvidenceItemShell({
    id: "evidence-1",
    matterId: matter.id,
    kind: "LEDGER",
    title: "Rent ledger",
    fileName: "rent-ledger.pdf",
    mimeType: "application/pdf",
    sizeBytes: 4096,
    sourceReferenceIds: ["source-1"],
    privacyClass: "PERSONAL",
    retentionClass: "ARREARS_MVP_WORKING",
    holdStatus: "NONE",
    sourceSensitivity: "PERSONAL"
  });
  const noticeDraft: NoticeDraft = {
    id: "draft-1",
    matterId: matter.id,
    version: 1,
    draftStatus: "READY_FOR_REVIEW",
    forumPath: createForumPathState({ path: "VIC_VCAT_RENT_ARREARS" }),
    outputMode: createOutputModeState("PRINTABLE_OUTPUT"),
    unresolvedIssueIds: [],
    privacyHooks: buildBr04PrivacyHooks({
      lifecycleState: "REVIEW_NEEDED",
      retentionPolicyRefs: [createRetentionPolicyRef({
        id: "policy-2",
        policyKey: "NOTICE_DRAFT_RECORD",
        dataClassId: dataClass.id,
        appliesTo: "NOTICE_DRAFT",
        policyStatus: "REVIEW_REQUIRED"
      })]
    }),
    sourceReferenceIds: []
  };
  const outputPackage: OutputPackage = {
    id: "output-1",
    matterId: matter.id,
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    noticeDraftId: noticeDraft.id,
    evidenceItemIds: [evidence.id],
    touchpointIds: [],
    carryForwardControls: [],
    completeness: "PARTIAL",
    privacyHooks: buildBr04PrivacyHooks({
      accessScopeIds: ["scope-2"],
      lifecycleActionIds: ["action-1"]
    })
  };

  assert.equal(matter.privacyHooks.retentionPolicyRefs[0]?.configurable, true);
  assert.equal(evidence.privacyHooks.lifecycleState, "NORMAL_LIFECYCLE");
  assert.equal(noticeDraft.privacyHooks.lifecycleState, "REVIEW_NEEDED");
  assert.equal(outputPackage.privacyHooks.lifecycleActionIds[0], "action-1");
});

test("scoped hold and lifecycle placeholders remain scoped and review-led", () => {
  const scope = createPreservationScope({
    id: "scope-1",
    matterId: "matter-2",
    subjectType: "EVIDENCE_ITEM",
    subjectId: "evidence-2",
    scopeLabel: "Ledger evidence only"
  });
  const hold = createScopedHoldFlag({
    id: "hold-1",
    matterId: "matter-2",
    scope,
    reason: createHoldReason({
      code: "PRESERVATION_REVIEW",
      label: "Preservation review",
      summary: "Placeholder hold reason while trigger extraction remains pending."
    }),
    status: "ACTIVE",
    appliedAt: "2026-04-11T10:00:00.000Z"
  });
  const deletionRequest = createDeletionRequest({
    id: "delete-1",
    matterId: "matter-2",
    subjectType: "EVIDENCE_ITEM",
    subjectId: "evidence-2",
    requestedAt: "2026-04-11T10:15:00.000Z",
    requestedByRole: "MATTER_OPERATOR",
    blockedByHoldFlagIds: [hold.id]
  });
  const deidentificationAction = createDeidentificationAction({
    id: "deid-1",
    matterId: "matter-2",
    subjectType: "OUTPUT_PACKAGE",
    subjectId: "output-2",
    requestedAt: "2026-04-11T10:20:00.000Z",
    requestedByRole: "PRIVACY_REVIEWER"
  });

  assert.equal(hold.scope.subjectType, "EVIDENCE_ITEM");
  assert.equal(hold.releaseAuthorityKey, "REVIEW_REQUIRED");
  assert.equal(deletionRequest.lifecycleState, "DELETION_REQUESTED");
  assert.equal(deletionRequest.blockedByHoldFlagIds[0], hold.id);
  assert.equal(deidentificationAction.methodStatus, "PLACEHOLDER_PENDING_POLICY");
});

test("privacy audit and role boundaries preserve access and linkage metadata", () => {
  const reviewScope = createAccessScope({
    id: "access-1",
    subjectType: "MATTER",
    subjectId: "matter-3",
    scopeLabel: "Matter privacy review scope"
  });
  const auditScope = createAccessScope({
    id: "access-2",
    subjectType: "PRIVACY_AUDIT",
    scopeLabel: "Audit-only visibility"
  });
  const roleBoundary = createPrivacyRoleBoundary({
    id: "boundary-1",
    role: "PRIVACY_REVIEWER",
    accessScopeIds: [reviewScope.id, auditScope.id],
    allowedOperations: ["CLASSIFY_DATA", "ATTACH_RETENTION_POLICY", "REVIEW_LIFECYCLE"],
    reviewRequiredOperations: ["REQUEST_HOLD_RELEASE"],
    blockedOperations: ["VIEW_AUDIT_LOG"]
  });
  const auditEvent = createPrivacyAuditEvent({
    id: "privacy-audit-1",
    at: "2026-04-11T11:00:00.000Z",
    actor: "privacy-reviewer",
    actorType: "OPERATOR",
    matterId: "matter-3",
    controlArea: "HOLD",
    action: "HOLD_SCOPE_RECORDED",
    severity: "WARNING",
    outcome: "REVIEW_REQUIRED",
    subjectType: "HOLD_FLAG",
    subjectId: "hold-2",
    lifecycleState: "HOLD_AFFECTED",
    deterministic: false,
    accessRole: roleBoundary.role,
    accessScopeId: reviewScope.id,
    policyKeys: ["MATTER_PRIMARY_RECORD"],
    holdFlagIds: ["hold-2"],
    metadata: { scoped: true }
  });
  const qaHook = br04QaInventoryHooks.find((candidate) => candidate.id === "BR04-AUDIT-SHAPE");

  assert.deepEqual(roleBoundary.accessScopeIds, [reviewScope.id, auditScope.id]);
  assert.ok(roleBoundary.allowedOperations.includes("REVIEW_LIFECYCLE"));
  assert.equal(auditEvent.event, "HOLD:HOLD_SCOPE_RECORDED");
  assert.equal(auditEvent.accessRole, "PRIVACY_REVIEWER");
  assert.equal(auditEvent.holdFlagIds[0], "hold-2");
  assert.ok(qaHook?.testFiles.includes("tests/br04-privacy-scaffold.test.ts"));
});
