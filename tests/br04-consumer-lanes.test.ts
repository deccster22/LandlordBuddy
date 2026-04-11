import test from "node:test";
import assert from "node:assert/strict";

import {
  createForumPathState,
  createOutputModeState,
  createPrivacyLifecycleHooks
} from "../src/domain/model.js";
import { createPrivacyAuditRecord } from "../src/modules/audit/index.js";
import {
  createPrivacyAuditEvent,
  loadBr04PolicySource
} from "../src/modules/br04/index.js";
import { createNoticeDraftRecord } from "../src/modules/notice-draft/index.js";

function buildNoticeDraftInput() {
  return {
    id: "draft-1",
    matterId: "matter-1",
    version: 1,
    preparedAt: "2026-04-11T12:00:00.000Z",
    draftStatus: "READY_FOR_REVIEW" as const,
    forumPath: createForumPathState({ path: "VIC_VCAT_RENT_ARREARS" }),
    outputMode: createOutputModeState("PRINTABLE_OUTPUT"),
    unresolvedIssueIds: [],
    sourceReferenceIds: ["source-1"]
  };
}

function buildPrivacyAuditInput() {
  return {
    id: "privacy-audit-1",
    at: "2026-04-11T12:15:00.000Z",
    actor: "privacy-reviewer",
    actorType: "OPERATOR" as const,
    matterId: "matter-1",
    controlArea: "RETENTION" as const,
    action: "NOTICE_DRAFT_LINKAGE_RECORDED",
    severity: "INFO" as const,
    outcome: "RECORDED" as const,
    subjectType: "NOTICE_DRAFT" as const,
    subjectId: "draft-1",
    lifecycleState: "REVIEW_NEEDED" as const,
    deterministic: true,
    accessRole: "PRIVACY_REVIEWER" as const,
    sourceReferenceIds: ["source-1"]
  };
}

test("notice draft records receive source-driven BR04 policy and access refs while keeping hook shape stable", () => {
  const noticeDraft = createNoticeDraftRecord(buildNoticeDraftInput());

  assert.equal(noticeDraft.draftStatus, "READY_FOR_REVIEW");
  assert.equal(noticeDraft.privacyHooks.lifecycleState, "REVIEW_NEEDED");
  assert.deepEqual(noticeDraft.privacyHooks.dataClassIds, ["BR04-DATA-CLASS-NOTICE-DRAFT"]);
  assert.equal(
    noticeDraft.privacyHooks.retentionPolicyRefs[0]?.policyKey,
    "NOTICE_DRAFT_RECORD"
  );
  assert.deepEqual(noticeDraft.privacyHooks.accessScopeIds, ["BR04-SCOPE-NOTICE-REVIEW"]);
  assert.deepEqual(
    Object.keys(noticeDraft.privacyHooks).sort(),
    Object.keys(createPrivacyLifecycleHooks()).sort()
  );
});

test("privacy audit records receive source-driven BR04 policy and access linkage while keeping event shape stable", () => {
  const auditInput = buildPrivacyAuditInput();
  const auditEvent = createPrivacyAuditRecord(auditInput, {
    appliesTo: "NOTICE_DRAFT"
  });
  const baselineEvent = createPrivacyAuditEvent({
    ...auditInput,
    accessScopeId: "BR04-SCOPE-NOTICE-REVIEW",
    policyKeys: ["NOTICE_DRAFT_RECORD"]
  });

  assert.equal(auditEvent.event, "RETENTION:NOTICE_DRAFT_LINKAGE_RECORDED");
  assert.equal(auditEvent.accessScopeId, "BR04-SCOPE-NOTICE-REVIEW");
  assert.deepEqual(auditEvent.policyKeys, ["NOTICE_DRAFT_RECORD"]);
  assert.deepEqual(Object.keys(auditEvent).sort(), Object.keys(baselineEvent).sort());
});

test("ambiguous BR04 target defaults fail loudly until notice-draft and privacy-audit callers select explicitly", () => {
  const source = loadBr04PolicySource();
  const ambiguousPolicySource = {
    ...source,
    retentionPolicies: [
      ...source.retentionPolicies,
      {
        id: "BR04-POLICY-NOTICE-DRAFT-SECONDARY",
        policyKey: "NOTICE_DRAFT_ARCHIVE_REVIEW",
        dataClassId: "BR04-DATA-CLASS-NOTICE-DRAFT",
        appliesTo: "NOTICE_DRAFT" as const,
        policyStatus: "REVIEW_REQUIRED" as const,
        configurable: true as const,
        durationStatus: "PLACEHOLDER_PENDING_CONFIG" as const,
        durationModelKey: "CONFIGURE_LATER" as const,
        noUniversalLifecycleRule: true as const,
        guardedInsertionPoint: source.retentionPolicies[0]?.guardedInsertionPoint ?? "",
        notes: [
          "Archive-side draft policy remains placeholder-only.",
          "Explicit selection is required once multiple draft policies exist."
        ]
      }
    ]
  };
  const ambiguousScopeSource = {
    ...source,
    accessScopes: [
      ...source.accessScopes,
      {
        id: "BR04-SCOPE-NOTICE-ESCALATION",
        subjectType: "NOTICE_DRAFT" as const,
        scopeLabel: "Notice draft escalation review scope",
        notes: [
          "Secondary draft scope remains placeholder-only.",
          "Explicit selection is required once multiple draft scopes exist."
        ]
      }
    ]
  };
  const explicitSelectionSource = {
    ...ambiguousPolicySource,
    accessScopes: ambiguousScopeSource.accessScopes
  };

  assert.throws(
    () => createNoticeDraftRecord(buildNoticeDraftInput(), {
      source: ambiguousPolicySource
    }),
    /default retention policy selection for NOTICE_DRAFT is ambiguous; explicit policyKeys are required/i
  );
  assert.throws(
    () => createPrivacyAuditRecord(buildPrivacyAuditInput(), {
      source: ambiguousScopeSource,
      appliesTo: "NOTICE_DRAFT"
    }),
    /default access scope selection for NOTICE_DRAFT is ambiguous; explicit accessScopeIds are required/i
  );

  const noticeDraft = createNoticeDraftRecord(buildNoticeDraftInput(), {
    source: explicitSelectionSource,
    policyKeys: ["NOTICE_DRAFT_RECORD"],
    accessScopeIds: ["BR04-SCOPE-NOTICE-REVIEW"]
  });
  const auditEvent = createPrivacyAuditRecord(buildPrivacyAuditInput(), {
    source: explicitSelectionSource,
    appliesTo: "NOTICE_DRAFT",
    policyKeys: ["NOTICE_DRAFT_RECORD"],
    accessScopeId: "BR04-SCOPE-NOTICE-REVIEW"
  });

  assert.equal(noticeDraft.privacyHooks.retentionPolicyRefs.length, 1);
  assert.deepEqual(noticeDraft.privacyHooks.accessScopeIds, ["BR04-SCOPE-NOTICE-REVIEW"]);
  assert.deepEqual(auditEvent.policyKeys, ["NOTICE_DRAFT_RECORD"]);
  assert.equal(auditEvent.accessScopeId, "BR04-SCOPE-NOTICE-REVIEW");
});
