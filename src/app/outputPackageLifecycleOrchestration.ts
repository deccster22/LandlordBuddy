import type {
  DateTimeString,
  EntityId,
  HoldFlag,
  HoldReason,
  OutputPackage,
  PreservationScope,
  PrivacyAuditEvent,
  PrivacyRole
} from "../domain/model.js";
import {
  createHoldReason,
  createPreservationScope,
  createBr04HoldCommand,
  createBr04LifecycleRuntimeRecord,
  createInMemoryBr04LifecycleAuditHook,
  executeBr04HoldCommand,
  planBr04LifecycleAction,
  type Br04HoldCommandResult,
  type Br04HoldCommandType,
  type Br04LifecycleActionPlan,
  type Br04LifecycleRuntimeRecord,
  type Br04PolicySource
} from "../modules/br04/index.js";
import {
  createOutputPackageRecord,
  type CreateOutputPackageRecordInput,
  type OutputPackagePrivacyHookSourceInput
} from "../modules/output/index.js";

export interface OutputPackageLifecycleRequestInput {
  id: EntityId;
  requestedAction: "REQUEST_DELETION" | "REQUEST_DEIDENTIFICATION";
  requestedAt: DateTimeString;
  requestedByRole: PrivacyRole;
  policyKey?: string | undefined;
  accessScopeId?: EntityId | undefined;
  sourceReferenceIds?: EntityId[] | undefined;
}

export interface OutputPackageLifecycleHoldCommandInput {
  id: EntityId;
  command: Br04HoldCommandType;
  requestedAt: DateTimeString;
  requestedByRole: PrivacyRole;
  holdFlagId?: EntityId | undefined;
  releaseApprovedByRole?: PrivacyRole | undefined;
  scope?: PreservationScope | undefined;
  reason?: HoldReason | undefined;
  notes?: string[] | undefined;
  sourceReferenceIds?: EntityId[] | undefined;
}

export interface OrchestrateOutputPackageLifecycleInput {
  outputPackageInput: CreateOutputPackageRecordInput;
  outputPackagePrivacyHookInput?: OutputPackagePrivacyHookSourceInput | undefined;
  source?: Br04PolicySource | undefined;
  lifecycleRequest: OutputPackageLifecycleRequestInput;
  holdFlags?: readonly HoldFlag[] | undefined;
  holdCommands?: readonly OutputPackageLifecycleHoldCommandInput[] | undefined;
  releasedHoldFlagIds?: readonly EntityId[] | undefined;
}

export interface OutputPackageLifecycleReplayEnvelope {
  lifecycleRequest: OutputPackageLifecycleRequestInput;
  matterId: EntityId;
  outputPackageId: EntityId;
  dataClassId: EntityId;
  policyKey?: string;
  accessScopeId?: EntityId;
  holdFlags: HoldFlag[];
  releasedHoldFlagIds: EntityId[];
}

export interface OutputPackageLifecycleOrchestrationRecord {
  orchestrationVersion: "P4B-CX-BR04-07";
  outputPackage: OutputPackage;
  runtimeRecord: Br04LifecycleRuntimeRecord;
  lifecyclePlan: Br04LifecycleActionPlan;
  holdCommandResults: Br04HoldCommandResult[];
  auditEvents: PrivacyAuditEvent[];
  replay: OutputPackageLifecycleReplayEnvelope;
}

export interface ReplayOutputPackageLifecycleOrchestrationInput {
  orchestrationRecord: OutputPackageLifecycleOrchestrationRecord;
  source?: Br04PolicySource | undefined;
}

export function orchestrateOutputPackageLifecycle(
  input: OrchestrateOutputPackageLifecycleInput
): OutputPackageLifecycleOrchestrationRecord {
  const outputPackage = createOutputPackageRecord(
    input.outputPackageInput,
    resolveOutputPackagePrivacyHookInput({
      source: input.source,
      privacyHookInput: input.outputPackagePrivacyHookInput
    })
  );
  const dataClassId = resolveOutputPackageLifecycleDataClassId(outputPackage);
  const policyKey = resolveOutputPackageLifecyclePolicyKey(
    outputPackage,
    input.lifecycleRequest.policyKey
  );
  const accessScopeId = resolveOutputPackageLifecycleAccessScopeId(
    outputPackage,
    input.lifecycleRequest.accessScopeId
  );
  const auditHook = createInMemoryBr04LifecycleAuditHook();
  const holdFlagsById = new Map(
    (input.holdFlags ?? []).map((holdFlag) => [holdFlag.id, holdFlag] as const)
  );
  let releasedHoldFlagIds = uniqueEntityIds(input.releasedHoldFlagIds ?? []);
  const holdCommandResults: Br04HoldCommandResult[] = [];

  for (const holdCommandInput of input.holdCommands ?? []) {
    const command = createBr04HoldCommand({
      id: holdCommandInput.id,
      matterId: outputPackage.matterId,
      subjectType: "OUTPUT_PACKAGE",
      subjectId: outputPackage.id,
      dataClassId,
      ...(policyKey ? { policyKey } : {}),
      command: holdCommandInput.command,
      requestedAt: holdCommandInput.requestedAt,
      requestedByRole: holdCommandInput.requestedByRole,
      ...(holdCommandInput.holdFlagId ? { holdFlagId: holdCommandInput.holdFlagId } : {}),
      ...(holdCommandInput.releaseApprovedByRole
        ? { releaseApprovedByRole: holdCommandInput.releaseApprovedByRole }
        : {}),
      ...(holdCommandInput.notes ? { notes: holdCommandInput.notes } : {}),
      ...(holdCommandInput.sourceReferenceIds
        ? { sourceReferenceIds: holdCommandInput.sourceReferenceIds }
        : {})
    });
    const existingHoldFlag = command.holdFlagId
      ? holdFlagsById.get(command.holdFlagId)
      : undefined;
    const holdCommandResult = executeBr04HoldCommand({
      command,
      source: input.source,
      ...(holdCommandInput.command === "APPLY_HOLD"
        ? {
            scope: holdCommandInput.scope
              ?? buildDefaultOutputPackageHoldScope(outputPackage),
            reason: holdCommandInput.reason
              ?? buildDefaultOutputPackageHoldReason()
          }
        : {}),
      ...(existingHoldFlag ? { holdFlag: existingHoldFlag } : {}),
      ...(accessScopeId ? { accessScopeId } : {}),
      auditHook
    });

    if (holdCommandResult.holdFlag) {
      holdFlagsById.set(holdCommandResult.holdFlag.id, holdCommandResult.holdFlag);
    }

    releasedHoldFlagIds = uniqueEntityIds([
      ...releasedHoldFlagIds,
      ...holdCommandResult.releasedHoldFlagIds
    ]);
    holdCommandResults.push(holdCommandResult);
  }

  const holdFlags = [...holdFlagsById.values()];
  const runtimeRecord = createBr04LifecycleRuntimeRecord({
    source: input.source,
    matterId: outputPackage.matterId,
    subjectType: "OUTPUT_PACKAGE",
    subjectId: outputPackage.id,
    dataClassId,
    ...(policyKey ? { policyKey } : {}),
    holdFlags,
    releasedHoldFlagIds,
    accessScopeIds: outputPackage.privacyHooks.accessScopeIds
  });
  const lifecyclePlan = planBr04LifecycleAction({
    id: input.lifecycleRequest.id,
    source: input.source,
    matterId: outputPackage.matterId,
    subjectType: "OUTPUT_PACKAGE",
    subjectId: outputPackage.id,
    dataClassId,
    ...(policyKey ? { policyKey } : {}),
    requestedAction: input.lifecycleRequest.requestedAction,
    requestedAt: input.lifecycleRequest.requestedAt,
    requestedByRole: input.lifecycleRequest.requestedByRole,
    holdFlags,
    releasedHoldFlagIds,
    ...(accessScopeId ? { accessScopeId } : {}),
    auditHook,
    ...(input.lifecycleRequest.sourceReferenceIds
      ? { sourceReferenceIds: input.lifecycleRequest.sourceReferenceIds }
      : {})
  });

  return {
    orchestrationVersion: "P4B-CX-BR04-07",
    outputPackage,
    runtimeRecord,
    lifecyclePlan,
    holdCommandResults,
    auditEvents: auditHook.list(),
    replay: {
      lifecycleRequest: input.lifecycleRequest,
      matterId: outputPackage.matterId,
      outputPackageId: outputPackage.id,
      dataClassId,
      ...(policyKey ? { policyKey } : {}),
      ...(accessScopeId ? { accessScopeId } : {}),
      holdFlags,
      releasedHoldFlagIds
    }
  };
}

export function replayOutputPackageLifecycleOrchestration(
  input: ReplayOutputPackageLifecycleOrchestrationInput
): Br04LifecycleActionPlan {
  const replay = input.orchestrationRecord.replay;

  return planBr04LifecycleAction({
    id: replay.lifecycleRequest.id,
    source: input.source,
    matterId: replay.matterId,
    subjectType: "OUTPUT_PACKAGE",
    subjectId: replay.outputPackageId,
    dataClassId: replay.dataClassId,
    ...(replay.policyKey ? { policyKey: replay.policyKey } : {}),
    requestedAction: replay.lifecycleRequest.requestedAction,
    requestedAt: replay.lifecycleRequest.requestedAt,
    requestedByRole: replay.lifecycleRequest.requestedByRole,
    holdFlags: replay.holdFlags,
    releasedHoldFlagIds: replay.releasedHoldFlagIds,
    ...(replay.accessScopeId ? { accessScopeId: replay.accessScopeId } : {}),
    ...(replay.lifecycleRequest.sourceReferenceIds
      ? { sourceReferenceIds: replay.lifecycleRequest.sourceReferenceIds }
      : {})
  });
}

function resolveOutputPackagePrivacyHookInput(input: {
  source?: Br04PolicySource | undefined;
  privacyHookInput?: OutputPackagePrivacyHookSourceInput | undefined;
}): OutputPackagePrivacyHookSourceInput {
  if (input.privacyHookInput?.source || !input.source) {
    return input.privacyHookInput ?? {};
  }

  return {
    ...(input.privacyHookInput ?? {}),
    source: input.source
  };
}

function resolveOutputPackageLifecycleDataClassId(
  outputPackage: OutputPackage
): EntityId {
  const dataClassIds = uniqueEntityIds(outputPackage.privacyHooks.dataClassIds);

  if (dataClassIds.length === 0) {
    throw new Error(
      "Output-package lifecycle orchestration requires explicit BR04 data-class linkage."
    );
  }

  if (dataClassIds.length > 1) {
    throw new Error(
      "Output-package lifecycle orchestration is ambiguous across multiple data classes; explicit selection is required."
    );
  }

  const [dataClassId] = dataClassIds;

  if (!dataClassId) {
    throw new Error(
      "Output-package lifecycle orchestration could not resolve a data class id."
    );
  }

  return dataClassId;
}

function resolveOutputPackageLifecyclePolicyKey(
  outputPackage: OutputPackage,
  requestedPolicyKey?: string
): string {
  const retentionPolicyRefs = outputPackage.privacyHooks.retentionPolicyRefs;

  if (retentionPolicyRefs.length === 0) {
    throw new Error(
      "Output-package lifecycle orchestration requires at least one scoped retention policy ref; blanket keep/delete fallback is not allowed."
    );
  }

  const nonConfigurablePolicy = retentionPolicyRefs.find(
    (policyRef) => policyRef.configurable !== true
  );

  if (nonConfigurablePolicy) {
    throw new Error(
      `Output-package lifecycle orchestration requires configurable class-based policy refs; ${nonConfigurablePolicy.id} is not configurable.`
    );
  }

  if (requestedPolicyKey) {
    const matchedPolicyRef = retentionPolicyRefs.find(
      (policyRef) => policyRef.policyKey === requestedPolicyKey
    );

    if (!matchedPolicyRef) {
      throw new Error(
        `Output-package lifecycle orchestration cannot resolve policy key ${requestedPolicyKey}.`
      );
    }

    return matchedPolicyRef.policyKey;
  }

  const policyKeys = uniqueEntityIds(
    retentionPolicyRefs.map((policyRef) => policyRef.policyKey)
  );

  if (policyKeys.length > 1) {
    throw new Error(
      "Output-package lifecycle orchestration is ambiguous across multiple policy keys; explicit policy selection is required."
    );
  }

  const [policyKey] = policyKeys;

  if (!policyKey) {
    throw new Error(
      "Output-package lifecycle orchestration could not resolve a policy key."
    );
  }

  return policyKey;
}

function resolveOutputPackageLifecycleAccessScopeId(
  outputPackage: OutputPackage,
  requestedAccessScopeId?: EntityId
): EntityId {
  if (requestedAccessScopeId) {
    if (!outputPackage.privacyHooks.accessScopeIds.includes(requestedAccessScopeId)) {
      throw new Error(
        `Output-package lifecycle orchestration cannot resolve access scope ${requestedAccessScopeId} from output-package hooks.`
      );
    }

    return requestedAccessScopeId;
  }

  const [accessScopeId] = outputPackage.privacyHooks.accessScopeIds;

  if (!accessScopeId) {
    throw new Error(
      "Output-package lifecycle orchestration requires at least one explicit access scope ref."
    );
  }

  return accessScopeId;
}

function buildDefaultOutputPackageHoldScope(
  outputPackage: OutputPackage
): PreservationScope {
  return createPreservationScope({
    id: `${outputPackage.id}:lifecycle-hold-scope`,
    matterId: outputPackage.matterId,
    subjectType: "OUTPUT_PACKAGE",
    subjectId: outputPackage.id,
    scopeLabel: "Output package lifecycle scope"
  });
}

function buildDefaultOutputPackageHoldReason(): HoldReason {
  return createHoldReason({
    code: "OUTPUT_PACKAGE_LIFECYCLE_REVIEW",
    label: "Output package lifecycle review",
    summary: "Scoped hold reason placeholder while BR04 hold trigger taxonomy remains configurable."
  });
}

function uniqueEntityIds(values: readonly EntityId[]): EntityId[] {
  return [...new Set(values)];
}
