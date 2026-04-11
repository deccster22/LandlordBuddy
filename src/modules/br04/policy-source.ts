
import {
  GUARDED_INSERTION_POINTS,
  type AccessScope,
  type DataClass,
  type EntityId,
  type PrivacyOperation,
  type PrivacyRole,
  type RetentionPolicyRef,
  type SourceSensitivity
} from "../../domain/model.js";

export const br04DoctrinePlaceholderStatuses = [
  "CONFIGURE_LATER",
  "LOCAL_ONLY",
  "NOT_ALLOWED"
] as const;

export type Br04DoctrinePlaceholderStatus =
  (typeof br04DoctrinePlaceholderStatuses)[number];

export interface Br04DoctrinePlaceholderEntry {
  key: string;
  status: Br04DoctrinePlaceholderStatus;
  summary: string;
  notes: readonly string[];
}

export interface Br04DataClassRegistryEntry {
  id: EntityId;
  code: string;
  label: string;
  appliesTo: DataClass["appliesTo"];
  sensitivity: SourceSensitivity;
  summary: string;
  notes: readonly string[];
}

export interface Br04RetentionPolicyRegistryEntry {
  id: EntityId;
  policyKey: string;
  dataClassId: EntityId;
  appliesTo: RetentionPolicyRef["appliesTo"];
  policyStatus: RetentionPolicyRef["policyStatus"];
  configurable: true;
  durationStatus: "PLACEHOLDER_PENDING_CONFIG";
  durationModelKey: "CONFIGURE_LATER";
  noUniversalLifecycleRule: true;
  guardedInsertionPoint: string;
  notes: readonly string[];
}

export interface Br04AccessScopeRegistryEntry {
  id: EntityId;
  subjectType: AccessScope["subjectType"];
  subjectId?: EntityId;
  scopeLabel: string;
  notes: readonly string[];
}

export interface Br04PrivacyRoleBoundaryRegistryEntry {
  id: EntityId;
  role: PrivacyRole;
  accessScopeIds: readonly EntityId[];
  allowedOperations: readonly PrivacyOperation[];
  reviewRequiredOperations: readonly PrivacyOperation[];
  blockedOperations: readonly PrivacyOperation[];
  notes: readonly string[];
}

export interface Br04PolicySource {
  dataClasses: readonly Br04DataClassRegistryEntry[];
  retentionPolicies: readonly Br04RetentionPolicyRegistryEntry[];
  accessScopes: readonly Br04AccessScopeRegistryEntry[];
  privacyRoleBoundaries: readonly Br04PrivacyRoleBoundaryRegistryEntry[];
  doctrinePlaceholders: readonly Br04DoctrinePlaceholderEntry[];
}

export const br04DataClassRegistry: readonly Br04DataClassRegistryEntry[] = Object.freeze([
  {
    id: "BR04-DATA-CLASS-MATTER-PRIMARY",
    code: "MATTER_PRIMARY_RECORD",
    label: "Matter primary record",
    appliesTo: "MATTER",
    sensitivity: "PERSONAL",
    summary: "Primary matter-level privacy classification placeholder for the arrears-first lane.",
    notes: [
      "Classification source is stable here even though retention timing remains configurable.",
      "No rental-application handling is introduced by this placeholder class."
    ]
  },
  {
    id: "BR04-DATA-CLASS-EVIDENCE-WORKING",
    code: "EVIDENCE_WORKING_RECORD",
    label: "Evidence working record",
    appliesTo: "EVIDENCE_ITEM",
    sensitivity: "PERSONAL",
    summary: "Evidence-side working record placeholder for BR04 policy attachment.",
    notes: [
      "This source entry attaches structure only and does not settle retention duration.",
      "Local upload validation remains local-only and separate from lifecycle doctrine."
    ]
  },
  {
    id: "BR04-DATA-CLASS-NOTICE-DRAFT",
    code: "NOTICE_DRAFT_RECORD",
    label: "Notice draft record",
    appliesTo: "NOTICE_DRAFT",
    sensitivity: "PERSONAL",
    summary: "Draft-document record placeholder for later privacy lifecycle extraction.",
    notes: [
      "Document retention posture remains configurable.",
      "Prepared records remain separate from any official filing behaviour."
    ]
  },
  {
    id: "BR04-DATA-CLASS-OUTPUT-PACK",
    code: "OUTPUT_PACKAGE_RECORD",
    label: "Output package record",
    appliesTo: "OUTPUT_PACKAGE",
    sensitivity: "PERSONAL",
    summary: "Output-package record placeholder for handoff-facing privacy handling.",
    notes: [
      "This is a handoff/preparation structure only.",
      "Output-package handling remains distinct from official execution."
    ]
  }
]);

export const br04RetentionPolicyRegistry:
  readonly Br04RetentionPolicyRegistryEntry[] = Object.freeze([
    {
      id: "BR04-POLICY-MATTER-PRIMARY",
      policyKey: "MATTER_PRIMARY_RECORD",
      dataClassId: "BR04-DATA-CLASS-MATTER-PRIMARY",
      appliesTo: "MATTER",
      policyStatus: "ATTACHED",
      configurable: true,
      durationStatus: "PLACEHOLDER_PENDING_CONFIG",
      durationModelKey: "CONFIGURE_LATER",
      noUniversalLifecycleRule: true,
      guardedInsertionPoint: GUARDED_INSERTION_POINTS.privacyRetention,
      notes: [
        "Retention duration remains configurable and is not encoded here.",
        "Hold trigger detail, release authority, and review cadence remain outside this policy ref."
      ]
    },
    {
      id: "BR04-POLICY-EVIDENCE-WORKING",
      policyKey: "EVIDENCE_WORKING_RECORD",
      dataClassId: "BR04-DATA-CLASS-EVIDENCE-WORKING",
      appliesTo: "EVIDENCE_ITEM",
      policyStatus: "ATTACHED",
      configurable: true,
      durationStatus: "PLACEHOLDER_PENDING_CONFIG",
      durationModelKey: "CONFIGURE_LATER",
      noUniversalLifecycleRule: true,
      guardedInsertionPoint: GUARDED_INSERTION_POINTS.privacyRetention,
      notes: [
        "Evidence retention remains configurable and may later diverge by class or hold posture.",
        "This ref does not convert local validation outcomes into retention truth."
      ]
    },
    {
      id: "BR04-POLICY-NOTICE-DRAFT",
      policyKey: "NOTICE_DRAFT_RECORD",
      dataClassId: "BR04-DATA-CLASS-NOTICE-DRAFT",
      appliesTo: "NOTICE_DRAFT",
      policyStatus: "ATTACHED",
      configurable: true,
      durationStatus: "PLACEHOLDER_PENDING_CONFIG",
      durationModelKey: "CONFIGURE_LATER",
      noUniversalLifecycleRule: true,
      guardedInsertionPoint: GUARDED_INSERTION_POINTS.privacyRetention,
      notes: [
        "Draft retention remains configurable and does not imply final disposal doctrine.",
        "Prepared-for-review state remains separate from official action."
      ]
    },
    {
      id: "BR04-POLICY-OUTPUT-PACK",
      policyKey: "OUTPUT_PACKAGE_RECORD",
      dataClassId: "BR04-DATA-CLASS-OUTPUT-PACK",
      appliesTo: "OUTPUT_PACKAGE",
      policyStatus: "ATTACHED",
      configurable: true,
      durationStatus: "PLACEHOLDER_PENDING_CONFIG",
      durationModelKey: "CONFIGURE_LATER",
      noUniversalLifecycleRule: true,
      guardedInsertionPoint: GUARDED_INSERTION_POINTS.privacyRetention,
      notes: [
        "Output-package retention remains configurable and handoff-aware.",
        "No blanket keep/delete rule should be inferred from this attachment."
      ]
    }
  ]);

export const br04AccessScopeRegistry: readonly Br04AccessScopeRegistryEntry[] = Object.freeze([
  {
    id: "BR04-SCOPE-MATTER-REVIEW",
    subjectType: "MATTER",
    scopeLabel: "Matter privacy review scope",
    notes: [
      "Scope label is source-driven here while record-specific coverage remains attachable later."
    ]
  },
  {
    id: "BR04-SCOPE-EVIDENCE-REVIEW",
    subjectType: "EVIDENCE_ITEM",
    scopeLabel: "Evidence privacy handling scope",
    notes: [
      "Scope does not settle upload or evidentiary sufficiency.",
      "Evidence lifecycle handling remains reviewable."
    ]
  },
  {
    id: "BR04-SCOPE-NOTICE-REVIEW",
    subjectType: "NOTICE_DRAFT",
    scopeLabel: "Notice draft privacy review scope",
    notes: [
      "Scope exists for explicit linkage only and does not imply filing behaviour."
    ]
  },
  {
    id: "BR04-SCOPE-OUTPUT-REVIEW",
    subjectType: "OUTPUT_PACKAGE",
    scopeLabel: "Output package privacy handling scope",
    notes: [
      "Output-package access remains handoff-facing and prep-only."
    ]
  },
  {
    id: "BR04-SCOPE-AUDIT-READ",
    subjectType: "PRIVACY_AUDIT",
    scopeLabel: "Audit-only visibility scope",
    notes: [
      "Audit visibility remains explicit and distinct from lifecycle action authority."
    ]
  }
]);

export const br04PrivacyRoleBoundaryRegistry:
  readonly Br04PrivacyRoleBoundaryRegistryEntry[] = Object.freeze([
    {
      id: "BR04-ROLE-BOUNDARY-MATTER-OPERATOR",
      role: "MATTER_OPERATOR",
      accessScopeIds: [
        "BR04-SCOPE-MATTER-REVIEW",
        "BR04-SCOPE-EVIDENCE-REVIEW",
        "BR04-SCOPE-NOTICE-REVIEW",
        "BR04-SCOPE-OUTPUT-REVIEW"
      ],
      allowedOperations: ["CLASSIFY_DATA"],
      reviewRequiredOperations: [
        "ATTACH_RETENTION_POLICY",
        "REQUEST_DELETION",
        "REQUEST_DEIDENTIFICATION"
      ],
      blockedOperations: ["VIEW_AUDIT_LOG"],
      notes: [
        "Matter-operator posture stays explicit and does not become implied authority.",
        "Release authority and hold taxonomy remain unresolved outside this boundary."
      ]
    },
    {
      id: "BR04-ROLE-BOUNDARY-PRIVACY-REVIEWER",
      role: "PRIVACY_REVIEWER",
      accessScopeIds: [
        "BR04-SCOPE-MATTER-REVIEW",
        "BR04-SCOPE-EVIDENCE-REVIEW",
        "BR04-SCOPE-NOTICE-REVIEW",
        "BR04-SCOPE-OUTPUT-REVIEW"
      ],
      allowedOperations: [
        "CLASSIFY_DATA",
        "ATTACH_RETENTION_POLICY",
        "REVIEW_LIFECYCLE"
      ],
      reviewRequiredOperations: [
        "APPLY_HOLD",
        "REQUEST_HOLD_RELEASE",
        "REQUEST_DELETION",
        "REQUEST_DEIDENTIFICATION"
      ],
      blockedOperations: [],
      notes: [
        "Reviewer posture remains source-driven without claiming settled release authority.",
        "Explicit review-required operations preserve guarded doctrine rather than flattening it."
      ]
    },
    {
      id: "BR04-ROLE-BOUNDARY-AUDIT-READER",
      role: "AUDIT_READER",
      accessScopeIds: ["BR04-SCOPE-AUDIT-READ"],
      allowedOperations: ["VIEW_AUDIT_LOG"],
      reviewRequiredOperations: [],
      blockedOperations: [
        "ATTACH_RETENTION_POLICY",
        "APPLY_HOLD",
        "REQUEST_HOLD_RELEASE",
        "REQUEST_DELETION",
        "REQUEST_DEIDENTIFICATION"
      ],
      notes: [
        "Audit-reader posture stays distinct from lifecycle control authority."
      ]
    }
  ]);

export const br04DoctrinePlaceholderRegistry:
  readonly Br04DoctrinePlaceholderEntry[] = Object.freeze([
    {
      key: "RETENTION_DURATION",
      status: "CONFIGURE_LATER",
      summary: "Exact retention durations remain configurable and are not resolved in the BR04 policy source.",
      notes: [
        "Refs attach a source key only.",
        "No duration schedule is hard-coded in this lane."
      ]
    },
    {
      key: "HOLD_TRIGGER_TAXONOMY",
      status: "CONFIGURE_LATER",
      summary: "Hold trigger taxonomy remains unresolved and must stay outside deterministic policy source truth.",
      notes: [
        "Hold reasons stay placeholder-based.",
        "No settled hold-trigger enum is introduced here."
      ]
    },
    {
      key: "RELEASE_AUTHORITY",
      status: "CONFIGURE_LATER",
      summary: "Release authority remains unresolved and is not encoded in the policy source.",
      notes: [
        "Role boundaries do not imply final hold-release authority."
      ]
    },
    {
      key: "REVIEW_CADENCE",
      status: "CONFIGURE_LATER",
      summary: "Review cadence remains configurable and is intentionally absent from the resolved domain refs.",
      notes: [
        "No review timer or cadence truth is hard-coded here."
      ]
    },
    {
      key: "LOCAL_EVIDENCE_LIMITS",
      status: "LOCAL_ONLY",
      summary: "Evidence upload file-type and size checks remain local-only shell limits, not BR04 retention doctrine.",
      notes: [
        "Local validation remains separate from retention and access policy handling."
      ]
    },
    {
      key: "UNIVERSAL_KEEP_DELETE_RULE",
      status: "NOT_ALLOWED",
      summary: "No blanket keep/delete rule can be inferred from the BR04 policy source or hook assembly.",
      notes: [
        "Policies remain class-based and scoped.",
        "Hold-aware behaviour stays explicit and unresolved where doctrine is not settled."
      ]
    }
  ]);

export const br04DefaultPolicySource: Br04PolicySource = Object.freeze({
  dataClasses: br04DataClassRegistry,
  retentionPolicies: br04RetentionPolicyRegistry,
  accessScopes: br04AccessScopeRegistry,
  privacyRoleBoundaries: br04PrivacyRoleBoundaryRegistry,
  doctrinePlaceholders: br04DoctrinePlaceholderRegistry
});

export function loadBr04PolicySource(
  source: Br04PolicySource = br04DefaultPolicySource
): Br04PolicySource {
  return source;
}
