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
  type PrivacyLifecycleHookTarget,
  type PrivacyLifecycleState,
  type PrivacyOperation,
  type PrivacyRole,
  type PrivacyRoleBoundary,
  type RetentionPolicyRef,
  type SourceSensitivity
} from "../../domain/model.js";
import {
  loadBr04PolicySource,
  type Br04PolicySource
} from "./policy-source.js";

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

export interface Br04PolicyRegistryAssembly {
  dataClasses: DataClass[];
  retentionPolicyRefs: RetentionPolicyRef[];
  accessScopes: AccessScope[];
  privacyRoleBoundaries: PrivacyRoleBoundary[];
}

export interface ResolveBr04RetentionPolicyRefsInput {
  source?: Br04PolicySource | undefined;
  appliesTo?: PrivacyLifecycleHookTarget | undefined;
  policyKeys?: readonly string[] | undefined;
}

export interface ResolveBr04AccessScopesInput {
  source?: Br04PolicySource | undefined;
  ids?: readonly EntityId[] | undefined;
  subjectType?: AccessScope["subjectType"] | undefined;
}

export interface BuildBr04PrivacyHooksFromSourceInput {
  appliesTo: PrivacyLifecycleHookTarget;
  source?: Br04PolicySource | undefined;
  policyKeys?: readonly string[] | undefined;
  accessScopeIds?: readonly EntityId[] | undefined;
  hookOverrides?: Partial<PrivacyLifecycleHooks> | undefined;
}

export interface ValidateBr04RoleBoundaryOperationInput {
  id: EntityId;
  allowedOperations: readonly PrivacyOperation[];
  reviewRequiredOperations: readonly PrivacyOperation[];
  blockedOperations: readonly PrivacyOperation[];
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
  validateBr04RoleBoundaryOperationOverlap({
    id: input.id,
    allowedOperations: input.allowedOperations,
    reviewRequiredOperations: input.reviewRequiredOperations ?? [],
    blockedOperations: input.blockedOperations ?? []
  });

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


export function assembleBr04PolicyRegistry(
  source: Br04PolicySource = loadBr04PolicySource()
): Br04PolicyRegistryAssembly {
  validateBr04PolicySource(source);

  return {
    dataClasses: source.dataClasses.map((entry) => createDataClass({
      id: entry.id,
      code: entry.code,
      label: entry.label,
      appliesTo: entry.appliesTo,
      sensitivity: entry.sensitivity,
      summary: entry.summary,
      notes: [...entry.notes]
    })),
    retentionPolicyRefs: source.retentionPolicies.map((entry) => createRetentionPolicyRef({
      id: entry.id,
      policyKey: entry.policyKey,
      dataClassId: entry.dataClassId,
      appliesTo: entry.appliesTo,
      policyStatus: entry.policyStatus,
      guardedInsertionPoint: entry.guardedInsertionPoint,
      notes: [...entry.notes]
    })),
    accessScopes: source.accessScopes.map((entry) => createAccessScope({
      id: entry.id,
      subjectType: entry.subjectType,
      ...(entry.subjectId ? { subjectId: entry.subjectId } : {}),
      scopeLabel: entry.scopeLabel,
      notes: [...entry.notes]
    })),
    privacyRoleBoundaries: source.privacyRoleBoundaries.map((entry) => (
      createPrivacyRoleBoundary({
        id: entry.id,
        role: entry.role,
        accessScopeIds: [...entry.accessScopeIds],
        allowedOperations: [...entry.allowedOperations],
        reviewRequiredOperations: [...entry.reviewRequiredOperations],
        blockedOperations: [...entry.blockedOperations],
        notes: [...entry.notes]
      })
    ))
  };
}

export function resolveBr04RetentionPolicyRefs(
  input: ResolveBr04RetentionPolicyRefsInput = {}
): RetentionPolicyRef[] {
  const registry = assembleBr04PolicyRegistry(input.source);
  const retentionPolicyRefs = input.appliesTo
    ? registry.retentionPolicyRefs.filter(
        (candidate) => candidate.appliesTo === input.appliesTo
      )
    : registry.retentionPolicyRefs;

  if (input.policyKeys && input.policyKeys.length > 0) {
    const byPolicyKey = new Map(
      retentionPolicyRefs.map((policyRef) => [policyRef.policyKey, policyRef])
    );

    return input.policyKeys.map((policyKey) => {
      const policyRef = byPolicyKey.get(policyKey);

      if (!policyRef) {
        throw new Error(`Unknown BR04 retention policy key: ${policyKey}`);
      }

      return policyRef;
    });
  }

  if (input.appliesTo) {
    assertUnambiguousBr04DefaultSelection({
      appliesTo: input.appliesTo,
      candidates: retentionPolicyRefs,
      candidateLabel: "retention policy",
      selectionKey: "policyKeys"
    });
  }

  return retentionPolicyRefs;
}

export function resolveBr04AccessScopes(
  input: ResolveBr04AccessScopesInput = {}
): AccessScope[] {
  const registry = assembleBr04PolicyRegistry(input.source);

  if (input.ids && input.ids.length > 0) {
    const byId = new Map(registry.accessScopes.map((scope) => [scope.id, scope]));

    return input.ids.map((id) => {
      const scope = byId.get(id);

      if (!scope) {
        throw new Error(`Unknown BR04 access scope: ${id}`);
      }

      if (input.subjectType && scope.subjectType !== input.subjectType) {
        throw new Error(
          `BR04 access scope ${scope.id} for ${scope.subjectType} cannot be selected for ${input.subjectType}.`
        );
      }

      return scope;
    });
  }

  if (input.subjectType) {
    const accessScopes = registry.accessScopes.filter(
      (scope) => scope.subjectType === input.subjectType
    );

    assertUnambiguousBr04DefaultSelection({
      appliesTo: input.subjectType,
      candidates: accessScopes,
      candidateLabel: "access scope",
      selectionKey: "accessScopeIds"
    });

    return accessScopes;
  }

  return registry.accessScopes;
}

export function resolveBr04PrivacyRoleBoundaries(
  source: Br04PolicySource = loadBr04PolicySource()
): PrivacyRoleBoundary[] {
  return assembleBr04PolicyRegistry(source).privacyRoleBoundaries;
}

export function buildBr04PrivacyHooksFromSource(
  input: BuildBr04PrivacyHooksFromSourceInput
): PrivacyLifecycleHooks {
  const retentionPolicyRefs = resolveBr04RetentionPolicyRefs({
    source: input.source,
    appliesTo: input.appliesTo,
    policyKeys: input.policyKeys
  });
  const overrideRetentionPolicyRefs = input.hookOverrides?.retentionPolicyRefs ?? [];

  validateBr04HookRetentionPolicyOverrides({
    source: input.source,
    appliesTo: input.appliesTo,
    base: retentionPolicyRefs,
    overrides: overrideRetentionPolicyRefs
  });

  const dataClassIds = uniqueEntityIds([
    ...retentionPolicyRefs.map((policyRef) => policyRef.dataClassId),
    ...(input.hookOverrides?.dataClassIds ?? [])
  ]);
  const resolvedAccessScopeIds = (
    input.accessScopeIds && input.accessScopeIds.length > 0
      ? resolveBr04HookAccessScopes({
          source: input.source,
          appliesTo: input.appliesTo,
          ids: input.accessScopeIds
        })
      : resolveBr04AccessScopes({
          source: input.source,
          subjectType: input.appliesTo
        })
  ).map((scope) => scope.id);
  const overrideAccessScopeIds = input.hookOverrides?.accessScopeIds ?? [];

  validateBr04HookAccessScopeOverrides({
    source: input.source,
    appliesTo: input.appliesTo,
    baseAccessScopeIds: resolvedAccessScopeIds,
    overrides: overrideAccessScopeIds
  });

  const accessScopeIds = uniqueEntityIds([
    ...resolvedAccessScopeIds,
    ...overrideAccessScopeIds
  ]);
  const mergedRetentionPolicyRefs = mergeRetentionPolicyRefs(
    retentionPolicyRefs,
    overrideRetentionPolicyRefs
  );

  validateBr04HookCoverage(input.appliesTo, mergedRetentionPolicyRefs, dataClassIds, accessScopeIds);

  return buildBr04PrivacyHooks({
    ...input.hookOverrides,
    dataClassIds,
    retentionPolicyRefs: mergedRetentionPolicyRefs,
    accessScopeIds
  });
}

export const br04QaInventoryHooks: readonly Br04QaInventoryHook[] = Object.freeze([
  {
    id: "BR04-HOOK-ATTACHMENT",
    area: "STRUCTURE",
    deterministic: true,
    invariant: "Matter, evidence, and document records carry explicit privacy lifecycle hooks instead of relying on inferred retention behavior.",
    scaffoldKeys: ["privacyHooks", "NORMAL_LIFECYCLE", "DELETION_REQUESTED"],
    testFiles: [
      "tests/br04-privacy-scaffold.test.ts",
      "tests/br04-consumer-lanes.test.ts",
      "tests/evidence-audit.framework.test.ts",
      "tests/output-handoff.framework.test.ts"
    ]
  },
  {
    id: "BR04-POLICY-PLACEHOLDER",
    area: "RETENTION",
    deterministic: false,
    invariant: "Retention policy refs attach to configurable slots and must not hard-code final durations.",
    scaffoldKeys: ["CONFIG_PENDING", "ATTACHED", "REVIEW_REQUIRED"],
    testFiles: [
      "tests/br04-privacy-scaffold.test.ts",
      "tests/br04-consumer-lanes.test.ts",
      "tests/evidence-audit.framework.test.ts"
    ]
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
    testFiles: ["tests/br04-privacy-scaffold.test.ts", "tests/br04-consumer-lanes.test.ts"]
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


function validateBr04PolicySource(source: Br04PolicySource): void {
  validateBr04NoUniversalKeepDeleteRule(source);

  assertUniqueValues(
    source.dataClasses.map((entry) => entry.id),
    "BR04 data class id"
  );
  assertUniqueValues(
    source.retentionPolicies.map((entry) => entry.id),
    "BR04 retention policy id"
  );
  assertUniqueValues(
    source.retentionPolicies.map((entry) => entry.policyKey),
    "BR04 retention policy key"
  );
  assertUniqueValues(
    source.accessScopes.map((entry) => entry.id),
    "BR04 access scope id"
  );
  assertUniqueValues(
    source.privacyRoleBoundaries.map((entry) => entry.id),
    "BR04 privacy role boundary id"
  );

  const dataClassIds = new Set(source.dataClasses.map((entry) => entry.id));

  for (const policyRef of source.retentionPolicies) {
    if (!dataClassIds.has(policyRef.dataClassId)) {
      throw new Error(
        `BR04 retention policy ${policyRef.id} references unknown data class ${policyRef.dataClassId}.`
      );
    }
  }

  const accessScopeIds = new Set(source.accessScopes.map((entry) => entry.id));

  for (const boundary of source.privacyRoleBoundaries) {
    validateBr04RoleBoundaryOperationOverlap(boundary);

    for (const accessScopeId of boundary.accessScopeIds) {
      if (!accessScopeIds.has(accessScopeId)) {
        throw new Error(
          `BR04 privacy role boundary ${boundary.id} references unknown access scope ${accessScopeId}.`
        );
      }
    }
  }
}

export function validateBr04RoleBoundaryOperationOverlap(
  boundary: ValidateBr04RoleBoundaryOperationInput
): void {
  const seen = new Map<PrivacyOperation, string>();

  registerOperationSet(boundary, seen, boundary.allowedOperations, "allowedOperations");
  registerOperationSet(
    boundary,
    seen,
    boundary.reviewRequiredOperations,
    "reviewRequiredOperations"
  );
  registerOperationSet(boundary, seen, boundary.blockedOperations, "blockedOperations");
}

function registerOperationSet(
  boundary: ValidateBr04RoleBoundaryOperationInput,
  seen: Map<PrivacyOperation, string>,
  operations: readonly PrivacyOperation[],
  setName: string
): void {
  for (const operation of operations) {
    const existingSet = seen.get(operation);

    if (existingSet) {
      throw new Error(
        `BR04 privacy role boundary ${boundary.id} maps operation ${operation} to both ${existingSet} and ${setName}.`
      );
    }

    seen.set(operation, setName);
  }
}

function validateBr04NoUniversalKeepDeleteRule(source: Br04PolicySource): void {
  const universalRuleGuard = source.doctrinePlaceholders.find(
    (entry) => entry.key === "UNIVERSAL_KEEP_DELETE_RULE"
  );

  if (universalRuleGuard?.status !== "NOT_ALLOWED") {
    throw new Error(
      "BR04 policy source must keep UNIVERSAL_KEEP_DELETE_RULE marked as NOT_ALLOWED."
    );
  }

  for (const policyRef of source.retentionPolicies) {
    if (policyRef.noUniversalLifecycleRule !== true) {
      throw new Error(
        `BR04 retention policy ${policyRef.id} must preserve the no-universal keep/delete guard.`
      );
    }
  }
}

function validateBr04HookCoverage(
  appliesTo: PrivacyLifecycleHookTarget,
  retentionPolicyRefs: readonly RetentionPolicyRef[],
  dataClassIds: readonly EntityId[],
  accessScopeIds: readonly EntityId[]
): void {
  if (retentionPolicyRefs.length === 0) {
    throw new Error(
      `BR04 privacy hooks for ${appliesTo} require at least one scoped retention policy ref; blanket keep/delete fallback is not allowed.`
    );
  }

  for (const policyRef of retentionPolicyRefs) {
    if (policyRef.appliesTo !== appliesTo) {
      throw new Error(
        `BR04 privacy hooks for ${appliesTo} cannot attach retention policy ${policyRef.id} for ${policyRef.appliesTo}.`
      );
    }

    if (policyRef.configurable !== true) {
      throw new Error(
        `BR04 retention policy ${policyRef.id} must remain configurable and placeholder-based.`
      );
    }
  }

  if (dataClassIds.length === 0) {
    throw new Error(
      `BR04 privacy hooks for ${appliesTo} require explicit data-class linkage.`
    );
  }

  if (accessScopeIds.length === 0) {
    throw new Error(
      `BR04 privacy hooks for ${appliesTo} require at least one explicit access scope ref.`
    );
  }
}

function resolveBr04HookAccessScopes(input: {
  source?: Br04PolicySource | undefined;
  appliesTo: PrivacyLifecycleHookTarget;
  ids: readonly EntityId[];
}): AccessScope[] {
  const accessScopes = resolveBr04AccessScopes({
    source: input.source,
    ids: input.ids
  });

  for (const accessScope of accessScopes) {
    if (
      accessScope.subjectType !== input.appliesTo
      && accessScope.subjectType !== "PRIVACY_AUDIT"
    ) {
      throw new Error(
        `BR04 privacy hooks for ${input.appliesTo} cannot attach access scope ${accessScope.id} for ${accessScope.subjectType}.`
      );
    }
  }

  return accessScopes;
}

function validateBr04HookAccessScopeOverrides(input: {
  source?: Br04PolicySource | undefined;
  appliesTo: PrivacyLifecycleHookTarget;
  baseAccessScopeIds: readonly EntityId[];
  overrides: readonly EntityId[];
}): void {
  if (input.overrides.length === 0) {
    return;
  }

  resolveBr04HookAccessScopes({
    source: input.source,
    appliesTo: input.appliesTo,
    ids: input.overrides
  });

  const selectedAccessScopeIds = new Set(input.baseAccessScopeIds);

  for (const accessScopeId of input.overrides) {
    if (!selectedAccessScopeIds.has(accessScopeId)) {
      throw new Error(
        `BR04 privacy hook overrides for ${input.appliesTo} cannot widen access scope attachment with ${accessScopeId}; select it via accessScopeIds instead.`
      );
    }
  }
}

function validateBr04HookRetentionPolicyOverrides(input: {
  source?: Br04PolicySource | undefined;
  appliesTo: PrivacyLifecycleHookTarget;
  base: readonly RetentionPolicyRef[];
  overrides: readonly RetentionPolicyRef[];
}): void {
  if (input.overrides.length === 0) {
    return;
  }

  const selectedPolicyIds = new Set(input.base.map((policyRef) => policyRef.id));
  const registryPolicyRefs = new Map(
    assembleBr04PolicyRegistry(input.source).retentionPolicyRefs.map((policyRef) => [
      policyRef.id,
      policyRef
    ])
  );

  for (const policyRef of input.overrides) {
    const registryPolicyRef = registryPolicyRefs.get(policyRef.id);

    if (!registryPolicyRef) {
      throw new Error(`Unknown BR04 retention policy override: ${policyRef.id}`);
    }

    if (registryPolicyRef.appliesTo !== input.appliesTo) {
      throw new Error(
        `BR04 privacy hooks for ${input.appliesTo} cannot attach retention policy ${policyRef.id} for ${registryPolicyRef.appliesTo}.`
      );
    }

    if (!selectedPolicyIds.has(policyRef.id)) {
      throw new Error(
        `BR04 privacy hook overrides for ${input.appliesTo} cannot widen retention policy attachment with ${policyRef.id}; select it via policyKeys instead.`
      );
    }

    if (
      policyRef.policyKey !== registryPolicyRef.policyKey
      || policyRef.dataClassId !== registryPolicyRef.dataClassId
      || policyRef.appliesTo !== registryPolicyRef.appliesTo
    ) {
      throw new Error(
        `BR04 privacy hook overrides for ${input.appliesTo} cannot alter source-linked retention policy ${policyRef.id}.`
      );
    }
  }
}

function assertUniqueValues(values: readonly string[], label: string): void {
  const uniqueValues = new Set(values);

  if (uniqueValues.size !== values.length) {
    throw new Error(`Duplicate ${label} detected in BR04 policy source.`);
  }
}

function assertUnambiguousBr04DefaultSelection(input: {
  appliesTo: string;
  candidates: readonly { id: EntityId }[];
  candidateLabel: string;
  selectionKey: string;
}): void {
  if (input.candidates.length <= 1) {
    return;
  }

  throw new Error(
    `BR04 default ${input.candidateLabel} selection for ${input.appliesTo} is ambiguous; explicit ${input.selectionKey} are required. Candidates: ${input.candidates.map((candidate) => candidate.id).join(", ")}.`
  );
}

function uniqueEntityIds(values: readonly EntityId[]): EntityId[] {
  return [...new Set(values)];
}

function mergeRetentionPolicyRefs(
  base: readonly RetentionPolicyRef[],
  overrides: readonly RetentionPolicyRef[]
): RetentionPolicyRef[] {
  const byId = new Map<string, RetentionPolicyRef>();

  for (const policyRef of [...base, ...overrides]) {
    byId.set(policyRef.id, policyRef);
  }

  return [...byId.values()];
}

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

export * from "./policy-source.js";
