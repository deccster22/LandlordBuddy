import test from "node:test";
import assert from "node:assert/strict";

import {
  GUARDED_INSERTION_POINTS,
  createForumPathState,
  createOfficialHandoffStateRecord,
  createOutputModeState,
  type Matter,
  type NoticeDraft,
  type OutputPackage
} from "../src/domain/model.js";
import { createEvidenceItemShell } from "../src/modules/evidence/index.js";
import {
  assembleBr04PolicyRegistry,
  br04QaInventoryHooks,
  buildBr04PrivacyHooks,
  buildBr04PrivacyHooksFromSource,
  createAccessScope,
  createDataClass,
  createDeidentificationAction,
  createDeletionRequest,
  createHoldReason,
  createPreservationScope,
  createPrivacyAuditEvent,
  createPrivacyRoleBoundary,
  createRetentionPolicyRef,
  createScopedHoldFlag,
  loadBr04PolicySource,
  resolveBr04AccessScopes,
  resolveBr04PrivacyRoleBoundaries
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

test("br04 policy source assembles placeholder-based policy refs, scopes, and boundaries", () => {
  const source = loadBr04PolicySource();
  const assembly = assembleBr04PolicyRegistry(source);
  const hooks = buildBr04PrivacyHooksFromSource({
    appliesTo: "MATTER",
    accessScopeIds: ["BR04-SCOPE-MATTER-REVIEW", "BR04-SCOPE-AUDIT-READ"],
    hookOverrides: {
      lifecycleState: "REVIEW_NEEDED",
      lifecycleActionIds: ["action-2"]
    }
  });
  const privacyReviewerBoundary = resolveBr04PrivacyRoleBoundaries(source).find(
    (boundary) => boundary.role === "PRIVACY_REVIEWER"
  );
  const matterAndAuditScopes = resolveBr04AccessScopes({
    source,
    ids: ["BR04-SCOPE-MATTER-REVIEW", "BR04-SCOPE-AUDIT-READ"]
  });

  assert.ok(assembly.dataClasses.some((entry) => entry.code === "MATTER_PRIMARY_RECORD"));
  assert.ok(assembly.retentionPolicyRefs.every((entry) => entry.configurable));
  assert.equal(hooks.retentionPolicyRefs[0]?.policyKey, "MATTER_PRIMARY_RECORD");
  assert.equal(hooks.retentionPolicyRefs[0]?.policyStatus, "ATTACHED");
  assert.deepEqual(
    hooks.accessScopeIds,
    ["BR04-SCOPE-MATTER-REVIEW", "BR04-SCOPE-AUDIT-READ"]
  );
  assert.equal(hooks.lifecycleActionIds[0], "action-2");
  assert.deepEqual(
    matterAndAuditScopes.map((scope) => scope.scopeLabel),
    ["Matter privacy review scope", "Audit-only visibility scope"]
  );
  assert.ok(privacyReviewerBoundary?.allowedOperations.includes("REVIEW_LIFECYCLE"));
  assert.ok(
    privacyReviewerBoundary?.reviewRequiredOperations.includes("REQUEST_HOLD_RELEASE")
  );
});

test("br04 policy source keeps unresolved doctrine placeholder-based and rejects blanket lifecycle inference", () => {
  const source = loadBr04PolicySource();
  const retentionPolicyEntry = source.retentionPolicies.find(
    (entry) => entry.policyKey === "MATTER_PRIMARY_RECORD"
  );
  const universalRuleGuard = source.doctrinePlaceholders.find(
    (entry) => entry.key === "UNIVERSAL_KEEP_DELETE_RULE"
  );
  const localEvidenceGuard = source.doctrinePlaceholders.find(
    (entry) => entry.key === "LOCAL_EVIDENCE_LIMITS"
  );

  assert.equal(retentionPolicyEntry?.durationStatus, "PLACEHOLDER_PENDING_CONFIG");
  assert.equal(retentionPolicyEntry?.durationModelKey, "CONFIGURE_LATER");
  assert.equal(
    retentionPolicyEntry?.guardedInsertionPoint,
    GUARDED_INSERTION_POINTS.privacyRetention
  );
  assert.equal(universalRuleGuard?.status, "NOT_ALLOWED");
  assert.match(universalRuleGuard?.summary ?? "", /blanket keep\/delete/i);
  assert.equal(localEvidenceGuard?.status, "LOCAL_ONLY");
});

test("br04 policy source rejects overlapping role-boundary operation sets", () => {
  const source = loadBr04PolicySource();
  const baseBoundary = source.privacyRoleBoundaries[0];

  assert.ok(baseBoundary);
  assert.throws(
    () => resolveBr04PrivacyRoleBoundaries({
      ...source,
      privacyRoleBoundaries: [
        {
          ...baseBoundary,
          allowedOperations: ["CLASSIFY_DATA", "VIEW_AUDIT_LOG"],
          reviewRequiredOperations: ["VIEW_AUDIT_LOG"]
        }
      ]
    }),
    /maps operation VIEW_AUDIT_LOG to both allowedOperations and reviewRequiredOperations/i
  );
});

