import type { Br04LifecycleRouteKind } from "../modules/br04/index.js";
import {
  selectLauncherCurrentMatterInternalTransitionFromOutputCheckpoint,
  type LauncherCurrentMatterTransitionSelection
} from "./launcherCurrentMatterTransitionSelector.js";
import type {
  HydrateOutputCheckpointInput
} from "./outputHandoffCheckpointHydration.js";

export const launcherCurrentMatterNonLifecycleTransitionPostures = [
  "NON_LIFECYCLE_CONTINUE_ALLOWED",
  "NON_LIFECYCLE_HOLD_REQUESTED"
] as const;

export type LauncherCurrentMatterNonLifecycleTransitionPosture =
  (typeof launcherCurrentMatterNonLifecycleTransitionPostures)[number];

export interface LauncherCurrentMatterNonLifecycleTransitionInput {
  progressionHoldRequested?: boolean;
  unresolvedBlockerCodes?: readonly string[];
  transitionHintCode?: string;
}

export interface LauncherCurrentMatterNonLifecycleTransitionState {
  posture: LauncherCurrentMatterNonLifecycleTransitionPosture;
  progressionHoldRequested: boolean;
  unresolvedBlockerCodes: string[];
  transitionHintCode?: string;
}

export const launcherCurrentMatterTransitionOrchestrationTargets = [
  "ORCHESTRATION_LIFECYCLE_CONTEXT_CONTINUE",
  "ORCHESTRATION_NO_RECORD_NON_CLEARANCE_CONTINUE",
  "ORCHESTRATION_FAIL_SAFE_HOLD",
  "ORCHESTRATION_EXPLICIT_NO_SIGNAL"
] as const;

export type LauncherCurrentMatterTransitionOrchestrationTarget =
  (typeof launcherCurrentMatterTransitionOrchestrationTargets)[number];

export const launcherCurrentMatterTransitionOrchestrationHandlingModes = [
  "ORCHESTRATION_MODE_LIFECYCLE_CONTEXT",
  "ORCHESTRATION_MODE_NO_RECORD_NON_CLEARANCE",
  "ORCHESTRATION_MODE_FAIL_SAFE_HOLD",
  "ORCHESTRATION_MODE_EXPLICIT_NO_SIGNAL"
] as const;

export type LauncherCurrentMatterTransitionOrchestrationHandlingMode =
  (typeof launcherCurrentMatterTransitionOrchestrationHandlingModes)[number];

export interface LauncherCurrentMatterTransitionOrchestrationDecisionBase {
  target: LauncherCurrentMatterTransitionOrchestrationTarget;
  handlingMode: LauncherCurrentMatterTransitionOrchestrationHandlingMode;
  clearanceInferred: false;
  proceedWithOrchestration: boolean;
  failSafeHoldHandling: boolean;
  explicitNoRoutingSignalHandling: boolean;
  noRecordNonClearanceHandling: boolean;
  lifecycleRoute: Br04LifecycleRouteKind | "NONE";
  holdAwareLifecycleStatePresent: boolean;
  releaseControlledLifecycleStatePresent: boolean;
  deletionRequestPresent: boolean;
  deidentificationActionPresent: boolean;
  lifecycleTransitionState: LauncherCurrentMatterTransitionSelection;
  nonLifecycleTransitionState: LauncherCurrentMatterNonLifecycleTransitionState;
}

export interface LifecycleContextContinueOrchestrationDecision
  extends LauncherCurrentMatterTransitionOrchestrationDecisionBase {
  target: "ORCHESTRATION_LIFECYCLE_CONTEXT_CONTINUE";
  handlingMode: "ORCHESTRATION_MODE_LIFECYCLE_CONTEXT";
  failSafeHoldHandling: false;
  explicitNoRoutingSignalHandling: false;
  noRecordNonClearanceHandling: false;
  lifecycleTransitionState: Extract<
    LauncherCurrentMatterTransitionSelection,
    { target: "TRANSITION_CONTINUE_WITH_LIFECYCLE_CONTEXT" }
  >;
}

export interface NoRecordNonClearanceContinueOrchestrationDecision
  extends LauncherCurrentMatterTransitionOrchestrationDecisionBase {
  target: "ORCHESTRATION_NO_RECORD_NON_CLEARANCE_CONTINUE";
  handlingMode: "ORCHESTRATION_MODE_NO_RECORD_NON_CLEARANCE";
  failSafeHoldHandling: false;
  explicitNoRoutingSignalHandling: false;
  noRecordNonClearanceHandling: true;
  lifecycleTransitionState: Extract<
    LauncherCurrentMatterTransitionSelection,
    { target: "TRANSITION_CONTINUE_NO_RECORD_NON_CLEARANCE" }
  >;
}

export interface FailSafeHoldOrchestrationDecision
  extends LauncherCurrentMatterTransitionOrchestrationDecisionBase {
  target: "ORCHESTRATION_FAIL_SAFE_HOLD";
  handlingMode: "ORCHESTRATION_MODE_FAIL_SAFE_HOLD";
  proceedWithOrchestration: false;
  failSafeHoldHandling: true;
  explicitNoRoutingSignalHandling: false;
  noRecordNonClearanceHandling: false;
  lifecycleTransitionState: Extract<
    LauncherCurrentMatterTransitionSelection,
    { target: "TRANSITION_HOLD_CANNOT_SAFELY_RESUME" }
  >;
}

export interface ExplicitNoSignalOrchestrationDecision
  extends LauncherCurrentMatterTransitionOrchestrationDecisionBase {
  target: "ORCHESTRATION_EXPLICIT_NO_SIGNAL";
  handlingMode: "ORCHESTRATION_MODE_EXPLICIT_NO_SIGNAL";
  proceedWithOrchestration: false;
  failSafeHoldHandling: false;
  explicitNoRoutingSignalHandling: true;
  noRecordNonClearanceHandling: false;
  lifecycleTransitionState: Extract<
    LauncherCurrentMatterTransitionSelection,
    { target: "TRANSITION_EXPLICIT_NO_ROUTING_SIGNAL" }
  >;
}

export type LauncherCurrentMatterTransitionOrchestrationDecision =
  | LifecycleContextContinueOrchestrationDecision
  | NoRecordNonClearanceContinueOrchestrationDecision
  | FailSafeHoldOrchestrationDecision
  | ExplicitNoSignalOrchestrationDecision;

export function orchestrateLauncherCurrentMatterTransitionEntry(input: {
  lifecycleTransitionState: LauncherCurrentMatterTransitionSelection;
  nonLifecycleTransitionInput?: LauncherCurrentMatterNonLifecycleTransitionInput;
}): LauncherCurrentMatterTransitionOrchestrationDecision {
  const nonLifecycleTransitionState = deriveNonLifecycleTransitionState(
    input.nonLifecycleTransitionInput
  );
  const lifecycleTransitionState = input.lifecycleTransitionState;
  const proceedWithOrchestration = (
    lifecycleTransitionState.proceedWithInternalTransition
    && nonLifecycleTransitionState.posture === "NON_LIFECYCLE_CONTINUE_ALLOWED"
  );

  if (lifecycleTransitionState.target === "TRANSITION_CONTINUE_WITH_LIFECYCLE_CONTEXT") {
    return {
      target: "ORCHESTRATION_LIFECYCLE_CONTEXT_CONTINUE",
      handlingMode: "ORCHESTRATION_MODE_LIFECYCLE_CONTEXT",
      clearanceInferred: false,
      proceedWithOrchestration,
      failSafeHoldHandling: false,
      explicitNoRoutingSignalHandling: false,
      noRecordNonClearanceHandling: false,
      lifecycleRoute: lifecycleTransitionState.lifecycleRoute,
      holdAwareLifecycleStatePresent: lifecycleTransitionState.holdAwareLifecycleStatePresent,
      releaseControlledLifecycleStatePresent:
        lifecycleTransitionState.releaseControlledLifecycleStatePresent,
      deletionRequestPresent: lifecycleTransitionState.deletionRequestPresent,
      deidentificationActionPresent: lifecycleTransitionState.deidentificationActionPresent,
      lifecycleTransitionState,
      nonLifecycleTransitionState
    };
  }

  if (lifecycleTransitionState.target === "TRANSITION_CONTINUE_NO_RECORD_NON_CLEARANCE") {
    return {
      target: "ORCHESTRATION_NO_RECORD_NON_CLEARANCE_CONTINUE",
      handlingMode: "ORCHESTRATION_MODE_NO_RECORD_NON_CLEARANCE",
      clearanceInferred: false,
      proceedWithOrchestration,
      failSafeHoldHandling: false,
      explicitNoRoutingSignalHandling: false,
      noRecordNonClearanceHandling: true,
      lifecycleRoute: "NONE",
      holdAwareLifecycleStatePresent: false,
      releaseControlledLifecycleStatePresent: false,
      deletionRequestPresent: false,
      deidentificationActionPresent: false,
      lifecycleTransitionState,
      nonLifecycleTransitionState
    };
  }

  if (lifecycleTransitionState.target === "TRANSITION_HOLD_CANNOT_SAFELY_RESUME") {
    return {
      target: "ORCHESTRATION_FAIL_SAFE_HOLD",
      handlingMode: "ORCHESTRATION_MODE_FAIL_SAFE_HOLD",
      clearanceInferred: false,
      proceedWithOrchestration: false,
      failSafeHoldHandling: true,
      explicitNoRoutingSignalHandling: false,
      noRecordNonClearanceHandling: false,
      lifecycleRoute: "NONE",
      holdAwareLifecycleStatePresent: false,
      releaseControlledLifecycleStatePresent: false,
      deletionRequestPresent: false,
      deidentificationActionPresent: false,
      lifecycleTransitionState,
      nonLifecycleTransitionState
    };
  }

  return {
    target: "ORCHESTRATION_EXPLICIT_NO_SIGNAL",
    handlingMode: "ORCHESTRATION_MODE_EXPLICIT_NO_SIGNAL",
    clearanceInferred: false,
    proceedWithOrchestration: false,
    failSafeHoldHandling: false,
    explicitNoRoutingSignalHandling: true,
    noRecordNonClearanceHandling: false,
    lifecycleRoute: "NONE",
    holdAwareLifecycleStatePresent: false,
    releaseControlledLifecycleStatePresent: false,
    deletionRequestPresent: false,
    deidentificationActionPresent: false,
    lifecycleTransitionState,
    nonLifecycleTransitionState
  };
}

export function orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint(
  input: {
    outputCheckpoint: HydrateOutputCheckpointInput;
    nonLifecycleTransitionInput?: LauncherCurrentMatterNonLifecycleTransitionInput;
  }
): LauncherCurrentMatterTransitionOrchestrationDecision {
  const lifecycleTransitionState =
    selectLauncherCurrentMatterInternalTransitionFromOutputCheckpoint(input.outputCheckpoint);

  return orchestrateLauncherCurrentMatterTransitionEntry({
    lifecycleTransitionState,
    ...(input.nonLifecycleTransitionInput
      ? { nonLifecycleTransitionInput: input.nonLifecycleTransitionInput }
      : {})
  });
}

function deriveNonLifecycleTransitionState(
  input: LauncherCurrentMatterNonLifecycleTransitionInput | undefined
): LauncherCurrentMatterNonLifecycleTransitionState {
  const unresolvedBlockerCodes = [
    ...(input?.unresolvedBlockerCodes ?? [])
  ];
  const progressionHoldRequested = input?.progressionHoldRequested === true;
  const holdRequested = progressionHoldRequested || unresolvedBlockerCodes.length > 0;

  return {
    posture: holdRequested
      ? "NON_LIFECYCLE_HOLD_REQUESTED"
      : "NON_LIFECYCLE_CONTINUE_ALLOWED",
    progressionHoldRequested,
    unresolvedBlockerCodes,
    ...(input?.transitionHintCode
      ? { transitionHintCode: input.transitionHintCode }
      : {})
  };
}
