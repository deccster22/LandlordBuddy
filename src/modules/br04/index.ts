import {
  GUARDED_INSERTION_POINTS,
  createPrivacyLifecycleHooks,
  type AccessScope,
  type DataClass,
  type DateTimeString,
  type DeidentificationAction,
  type DeletionRequest,
  type EntityId,
  type HoldFlag,
  type HoldReason,
  type LifecycleAction,
  type PreservationScope,
  type PrivacyAuditEvent,
  type PrivacyLifecycleHooks,
  type PrivacyLifecycleState,
  type PrivacyOperation,
  type PrivacyRole,
  type PrivacyRoleBoundary,
  type RetentionPolicyRef,
  type SourceSensitivity
} from "../../domain/model.js";

export interface CreateDataClassInput {
  id: EntityId;
  code: string;
  label: string;
  appliesTo: DataClass["appliesTo"];
  sensitivity: SourceSensitivity;
  summary: string;
  notes?: string[];
}

export interface CreateRetentionPolicyRefInput {
  id: EntityId;
  policyKey: string;
  dataClassId: EntityId;
  appliesTo: RetentionPolicyRef["appliesTo"];
  policyStatus?: RetentionPolicyRef["policyStatus"];
  guardedInsertionPoint?: string;
  notes?: string[];
}

export interface CreatePreservationScopeInput {
  id: EntityId;
  matterId: EntityId;
  subjectType: PreservationScope["subjectType"];
  subjectId: EntityId;
  scopeLabel: string;
  notes?: string[];
}

export interface CreateScopedHoldFlagInput {
  id: EntityId;
  matterId: EntityId;
  scope: PreservationScope;
  reason: HoldReason;
  status?: HoldFlag["status"];
  appliedAt?: DateTimeString;
  releaseRequestedAt?: DateTimeString;
  releaseAuthorityKey?: string;
  notes?: string[];
}

export interface CreateLifecycleActionInput {
  id: EntityId;
  matterId: EntityId;
  subjectType: LifecycleAction["subjectType"];
  subjectId: EntityId;
  action: LifecycleAction["action"];
  requestedAt: DateTimeString;
  requestedByRole: PrivacyRole;
  lifecycleState?: PrivacyLifecycleState;
  reviewRequired?: boolean;
  retentionPolicyRefId?: EntityId;
  holdFlagId?: EntityId;
  notes?: string[];
  sourceReferenceIds?: EntityId[];
}

export interface CreateDeletionRequestInput {
  id: EntityId;
  matterId: EntityId;
  subjectType: DeletionRequest["subjectType"];
  subjectId: EntityId;
  requestedAt: DateTimeString;
  requestedByRole: PrivacyRole;
  blockedByHoldFlagIds?: EntityId[];
  notes?: string[];
  sourceReferenceIds?: EntityId[];
}

export interface CreateDeidentificationActionInput {
  id: EntityId;
  matterId: EntityId;
  subjectType: DeidentificationAction["subjectType"];
  subjectId: EntityId;
  requestedAt: DateTimeString;
  requestedByRole: PrivacyRole;
  lifecycleState?: PrivacyLifecycleState;
  blockedByHoldFlagIds?: EntityId[];
  notes?: string[];
  sourceReferenceIds?: EntityId[];
}

export interface CreateAccessScopeInput {
  id: EntityId;
  subjectType: AccessScope["subjectType"];
  subjectId?: EntityId;
  scopeLabel: string;
  notes?: string[];
}

export interface CreatePrivacyRoleBoundaryInput {
  id: EntityId;
  role: PrivacyRole;
  accessScopeIds: EntityId[];
  allowedOperations: PrivacyOperation[];
  reviewRequiredOperations?: PrivacyOperation[];
  blockedOperations?: PrivacyOperation[];
  notes?: string[];
}

export interface CreatePrivacyAuditEventInput extends Omit<PrivacyAuditEvent, "event" | "policyKeys" | "holdFlagIds" | "sourceReferenceIds"> {
  policyKeys?: string[];
  holdFlagIds?: string[];
  sourceReferenceIds?: string[];
}

export const br04QaInventoryAreas = [
  "STRUCTURE",
  "RETENTION",
  "HOLD",
  "AUDIT",
  "ACCESS"
] as const;

export type Br04QaInventoryArea = (typeof br04QaInventoryAreas)[number];

export interface Br04QaInventoryHook {
  id: string;
  area: Br04QaInventoryArea;
  deterministic: boolean;
  invariant: string;
  scaffoldKeys: readonly string[];
  testFiles: readonly string[];
}

export function buildBr04PrivacyHooks(
  overrides: Partial<PrivacyLifecycleHooks> = {}
): PrivacyLifecycleHooks {
  return createPrivacyLifecycleHooks(overrides);
}

export function createDataClass(input: CreateDataClassInput): DataClass {
  return {
    id: input.id,
    code: input.code,
    label: input.label,
    appliesTo: input.appliesTo,
    sensitivity: input.sensitivity,
    summary: input.summary,
    ...(input.notes ? { notes: input.notes } : {})
  };
}

export function createRetentionPolicyRef(
  input: CreateRetentionPolicyRefInput
): RetentionPolicyRef {
  return {
    id: input.id,
    policyKey: input.policyKey,
    dataClassId: input.dataClassId,
    appliesTo: input.appliesTo,
    policyStatus: input.policyStatus ?? "CONFIG_PENDING",
    configurable: true,
    guardedInsertionPoint: input.guardedInsertionPoint
      ?? GUARDED_INSERTION_POINTS.privacyRetention,
    ...(input.notes ? { notes: input.notes } : {})
  };
}

export function createPreservationScope(
  input: CreatePreservationScopeInput
): PreservationScope {
  return {
    id: input.id,
    matterId: input.matterId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    scopeLabel: input.scopeLabel,
    ...(input.notes ? { notes: input.notes } : {})
  };
}

export function createHoldReason(input: {
  code: string;
  label: string;
  summary: string;
  guardedInsertionPoint?: string;
}): HoldReason {
  return {
    code: input.code,
    label: input.label,
    placeholder: true,
    summary: input.summary,
    guardedInsertionPoint: input.guardedInsertionPoint
      ?? GUARDED_INSERTION_POINTS.privacyHoldRelease
  };
}

export function createScopedHoldFlag(input: CreateScopedHoldFlagInput): HoldFlag {
  return {
    id: input.id,
    matterId: input.matterId,
    scope: input.scope,
    reason: input.reason,
    status: input.status ?? "REVIEW_REQUIRED",
    ...(input.appliedAt ? { appliedAt: input.appliedAt } : {}),
    ...(input.releaseRequestedAt
      ? { releaseRequestedAt: input.releaseRequestedAt }
      : {}),
    releaseAuthorityKey: input.releaseAuthorityKey ?? "REVIEW_REQUIRED",
    notes: input.notes ?? [
      "Hold trigger detail remains a later BR04 extraction point.",
      "Release authority and review cadence remain placeholder-only."
    ]
  };
}

export function createLifecycleAction(
  input: CreateLifecycleActionInput
): LifecycleAction {
  return {
    id: input.id,
    matterId: input.matterId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    action: input.action,
    lifecycleState: input.lifecycleState ?? deriveLifecycleState(input.action),
    requestedAt: input.requestedAt,
    requestedByRole: input.requestedByRole,
    reviewRequired: input.reviewRequired ?? true,
    ...(input.retentionPolicyRefId
      ? { retentionPolicyRefId: input.retentionPolicyRefId }
      : {}),
    ...(input.holdFlagId ? { holdFlagId: input.holdFlagId } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
    sourceReferenceIds: input.sourceReferenceIds ?? []
  };
}

export function createDeletionRequest(
  input: CreateDeletionRequestInput
): DeletionRequest {
  return {
    id: input.id,
    matterId: input.matterId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    lifecycleState: "DELETION_REQUESTED",
    requestedAt: input.requestedAt,
    requestedByRole: input.requestedByRole,
    blockedByHoldFlagIds: input.blockedByHoldFlagIds ?? [],
    reviewRequired: true,
    ...(input.notes ? { notes: input.notes } : {}),
    sourceReferenceIds: input.sourceReferenceIds ?? []
  };
}

export function createDeidentificationAction(
  input: CreateDeidentificationActionInput
): DeidentificationAction {
  return {
    id: input.id,
    matterId: input.matterId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    lifecycleState: input.lifecycleState ?? "REVIEW_NEEDED",
    requestedAt: input.requestedAt,
    requestedByRole: input.requestedByRole,
    methodStatus: "PLACEHOLDER_PENDING_POLICY",
    blockedByHoldFlagIds: input.blockedByHoldFlagIds ?? [],
    reviewRequired: true,
    ...(input.notes ? { notes: input.notes } : {}),
    sourceReferenceIds: input.sourceReferenceIds ?? []
  };
}

export function createAccessScope(input: CreateAccessScopeInput): AccessScope {
  return {
    id: input.id,
    subjectType: input.subjectType,
    ...(input.subjectId ? { subjectId: input.subjectId } : {}),
    scopeLabel: input.scopeLabel,
    ...(input.notes ? { notes: input.notes } : {})
  };
}

export function createPrivacyRoleBoundary(
  input: CreatePrivacyRoleBoundaryInput
): PrivacyRoleBoundary {
  return {
    id: input.id,
    role: input.role,
    accessScopeIds: input.accessScopeIds,
    allowedOperations: input.allowedOperations,
    reviewRequiredOperations: input.reviewRequiredOperations ?? [],
    blockedOperations: input.blockedOperations ?? [],
    notes: input.notes ?? [
      "Role boundaries remain explicit until later operational policy extraction."
    ]
  };
}

export function createPrivacyAuditEvent(
  input: CreatePrivacyAuditEventInput
): PrivacyAuditEvent {
  return {
    id: input.id,
    at: input.at,
    actor: input.actor,
    ...(input.actorType ? { actorType: input.actorType } : {}),
    event: input.controlArea + ":" + input.action,
    matterId: input.matterId,
    controlArea: input.controlArea,
    action: input.action,
    severity: input.severity,
    outcome: input.outcome,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    lifecycleState: input.lifecycleState,
    deterministic: input.deterministic,
    ...(input.accessRole ? { accessRole: input.accessRole } : {}),
    ...(input.accessScopeId ? { accessScopeId: input.accessScopeId } : {}),
    policyKeys: input.policyKeys ?? [],
    holdFlagIds: input.holdFlagIds ?? [],
    ...(input.detail ? { detail: input.detail } : {}),
    ...(input.metadata ? { metadata: input.metadata } : {}),
    sourceReferenceIds: input.sourceReferenceIds ?? []
  };
}

export const br04QaInventoryHooks: readonly Br04QaInventoryHook[] = Object.freeze([
  {
    id: "BR04-HOOK-ATTACHMENT",
    area: "STRUCTURE",
    deterministic: true,
    invariant: "Matter, evidence, and document records carry explicit privacy lifecycle hooks instead of relying on inferred retention behavior.",
    scaffoldKeys: ["privacyHooks", "NORMAL_LIFECYCLE", "DELETION_REQUESTED"],
    testFiles: ["tests/br04-privacy-scaffold.test.ts", "tests/evidence-audit.framework.test.ts"]
  },
  {
    id: "BR04-POLICY-PLACEHOLDER",
    area: "RETENTION",
    deterministic: false,
    invariant: "Retention policy refs attach to configurable slots and must not hard-code final durations.",
    scaffoldKeys: ["CONFIG_PENDING", "ATTACHED", "REVIEW_REQUIRED"],
    testFiles: ["tests/br04-privacy-scaffold.test.ts"]
  },
  {
    id: "BR04-SCOPED-HOLD",
    area: "HOLD",
    deterministic: false,
    invariant: "Hold flags remain scoped to a subject and do not imply blanket preservation or settled release authority.",
    scaffoldKeys: ["privacyHoldRelease", "RELEASE_REVIEW_REQUIRED", "PreservationScope"],
    testFiles: ["tests/br04-privacy-scaffold.test.ts"]
  },
  {
    id: "BR04-AUDIT-SHAPE",
    area: "AUDIT",
    deterministic: true,
    invariant: "Privacy audit events preserve control area, lifecycle state, policy linkage, hold linkage, and access-role metadata.",
    scaffoldKeys: ["CLASSIFICATION", "RETENTION", "HOLD", "LIFECYCLE", "ACCESS"],
    testFiles: ["tests/br04-privacy-scaffold.test.ts"]
  },
  {
    id: "BR04-ROLE-BOUNDARY",
    area: "ACCESS",
    deterministic: true,
    invariant: "Role boundaries stay explicit through access scopes plus allowed, review-required, and blocked operation sets.",
    scaffoldKeys: ["MATTER_OPERATOR", "PRIVACY_REVIEWER", "VIEW_AUDIT_LOG"],
    testFiles: ["tests/br04-privacy-scaffold.test.ts"]
  }
]);

function deriveLifecycleState(
  action: LifecycleAction["action"]
): PrivacyLifecycleState {
  if (action === "REQUEST_DELETION") {
    return "DELETION_REQUESTED";
  }

  if (action === "APPLY_HOLD" || action === "REQUEST_HOLD_RELEASE") {
    return "HOLD_AFFECTED";
  }

  return "REVIEW_NEEDED";
}
