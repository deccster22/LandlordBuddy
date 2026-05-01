import type { Br04LifecycleRouteKind } from "../modules/br04/index.js";
import {
  orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint,
  type LauncherCurrentMatterNonLifecycleTransitionInput,
  type LauncherCurrentMatterNonLifecycleTransitionState,
  type LauncherCurrentMatterTransitionOrchestrationDecision
} from "./launcherCurrentMatterTransitionOrchestrationEntry.js";
import type {
  HydrateOutputCheckpointInput
} from "./outputHandoffCheckpointHydration.js";
import type {
  LauncherCurrentMatterTransitionSelection
} from "./launcherCurrentMatterTransitionSelector.js";

export const launcherCurrentMatterExecutionDirectiveOutcomes = [
  "DIRECTIVE_CONTINUE_WITH_LIFECYCLE_CONTEXT",
  "DIRECTIVE_CONTINUE_NO_RECORD_NON_CLEARANCE",
  "DIRECTIVE_HOLD_CANNOT_SAFELY_RESUME",
  "DIRECTIVE_EXPLICIT_NO_ROUTING_SIGNAL"
] as const;

export type LauncherCurrentMatterExecutionDirectiveOutcome =
  (typeof launcherCurrentMatterExecutionDirectiveOutcomes)[number];

export interface LauncherCurrentMatterExecutionDirectiveBase {
  directive: LauncherCurrentMatterExecutionDirectiveOutcome;
  clearanceInferred: false;
  proceedWithInternalExecution: boolean;
  continueWithLifecycleContext: boolean;
  continueWithoutLifecycleRecordNonClearance: boolean;
  failSafeHoldDirective: boolean;
  explicitNoLifecycleRoutingSignalDirective: boolean;
  lifecycleRoute: Br04LifecycleRouteKind | "NONE";
  holdAwareLifecycleStatePresent: boolean;
  releaseControlledLifecycleStatePresent: boolean;
  deletionRequestPresent: boolean;
  deidentificationActionPresent: boolean;
  nonLifecycleHoldRequested: boolean;
  lifecycleTransitionState: LauncherCurrentMatterTransitionSelection;
  nonLifecycleTransitionState: LauncherCurrentMatterNonLifecycleTransitionState;
  orchestrationDecision: LauncherCurrentMatterTransitionOrchestrationDecision;
}

export interface ContinueWithLifecycleContextDirective
  extends LauncherCurrentMatterExecutionDirectiveBase {
  directive: "DIRECTIVE_CONTINUE_WITH_LIFECYCLE_CONTEXT";
  continueWithLifecycleContext: true;
  continueWithoutLifecycleRecordNonClearance: false;
  failSafeHoldDirective: false;
  explicitNoLifecycleRoutingSignalDirective: false;
  orchestrationDecision: Extract<
    LauncherCurrentMatterTransitionOrchestrationDecision,
    { target: "ORCHESTRATION_LIFECYCLE_CONTEXT_CONTINUE" }
  >;
}

export interface ContinueNoRecordNonClearanceDirective
  extends LauncherCurrentMatterExecutionDirectiveBase {
  directive: "DIRECTIVE_CONTINUE_NO_RECORD_NON_CLEARANCE";
  continueWithLifecycleContext: false;
  continueWithoutLifecycleRecordNonClearance: true;
  failSafeHoldDirective: false;
  explicitNoLifecycleRoutingSignalDirective: false;
  orchestrationDecision: Extract<
    LauncherCurrentMatterTransitionOrchestrationDecision,
    { target: "ORCHESTRATION_NO_RECORD_NON_CLEARANCE_CONTINUE" }
  >;
}

export interface HoldCannotSafelyResumeDirective
  extends LauncherCurrentMatterExecutionDirectiveBase {
  directive: "DIRECTIVE_HOLD_CANNOT_SAFELY_RESUME";
  proceedWithInternalExecution: false;
  continueWithLifecycleContext: false;
  continueWithoutLifecycleRecordNonClearance: false;
  failSafeHoldDirective: true;
  explicitNoLifecycleRoutingSignalDirective: false;
  orchestrationDecision: Extract<
    LauncherCurrentMatterTransitionOrchestrationDecision,
    { target: "ORCHESTRATION_FAIL_SAFE_HOLD" }
  >;
}

export interface ExplicitNoRoutingSignalDirective
  extends LauncherCurrentMatterExecutionDirectiveBase {
  directive: "DIRECTIVE_EXPLICIT_NO_ROUTING_SIGNAL";
  proceedWithInternalExecution: false;
  continueWithLifecycleContext: false;
  continueWithoutLifecycleRecordNonClearance: false;
  failSafeHoldDirective: false;
  explicitNoLifecycleRoutingSignalDirective: true;
  orchestrationDecision: Extract<
    LauncherCurrentMatterTransitionOrchestrationDecision,
    { target: "ORCHESTRATION_EXPLICIT_NO_SIGNAL" }
  >;
}

export type LauncherCurrentMatterExecutionDirective =
  | ContinueWithLifecycleContextDirective
  | ContinueNoRecordNonClearanceDirective
  | HoldCannotSafelyResumeDirective
  | ExplicitNoRoutingSignalDirective;

export function consumeLauncherCurrentMatterExecutionDirective(input: {
  orchestrationDecision: LauncherCurrentMatterTransitionOrchestrationDecision;
}): LauncherCurrentMatterExecutionDirective {
  const { orchestrationDecision } = input;
  const common = {
    clearanceInferred: false as const,
    proceedWithInternalExecution: orchestrationDecision.proceedWithOrchestration,
    lifecycleRoute: orchestrationDecision.lifecycleRoute,
    holdAwareLifecycleStatePresent:
      orchestrationDecision.holdAwareLifecycleStatePresent,
    releaseControlledLifecycleStatePresent:
      orchestrationDecision.releaseControlledLifecycleStatePresent,
    deletionRequestPresent: orchestrationDecision.deletionRequestPresent,
    deidentificationActionPresent:
      orchestrationDecision.deidentificationActionPresent,
    nonLifecycleHoldRequested:
      orchestrationDecision.nonLifecycleTransitionState.posture
      === "NON_LIFECYCLE_HOLD_REQUESTED",
    lifecycleTransitionState: orchestrationDecision.lifecycleTransitionState,
    nonLifecycleTransitionState: orchestrationDecision.nonLifecycleTransitionState
  };

  if (orchestrationDecision.target === "ORCHESTRATION_LIFECYCLE_CONTEXT_CONTINUE") {
    return {
      directive: "DIRECTIVE_CONTINUE_WITH_LIFECYCLE_CONTEXT",
      continueWithLifecycleContext: true,
      continueWithoutLifecycleRecordNonClearance: false,
      failSafeHoldDirective: false,
      explicitNoLifecycleRoutingSignalDirective: false,
      orchestrationDecision,
      ...common
    };
  }

  if (orchestrationDecision.target === "ORCHESTRATION_NO_RECORD_NON_CLEARANCE_CONTINUE") {
    return {
      directive: "DIRECTIVE_CONTINUE_NO_RECORD_NON_CLEARANCE",
      continueWithLifecycleContext: false,
      continueWithoutLifecycleRecordNonClearance: true,
      failSafeHoldDirective: false,
      explicitNoLifecycleRoutingSignalDirective: false,
      orchestrationDecision,
      ...common
    };
  }

  if (orchestrationDecision.target === "ORCHESTRATION_FAIL_SAFE_HOLD") {
    return {
      ...common,
      directive: "DIRECTIVE_HOLD_CANNOT_SAFELY_RESUME",
      proceedWithInternalExecution: false,
      continueWithLifecycleContext: false,
      continueWithoutLifecycleRecordNonClearance: false,
      failSafeHoldDirective: true,
      explicitNoLifecycleRoutingSignalDirective: false,
      orchestrationDecision
    };
  }

  return {
    ...common,
    directive: "DIRECTIVE_EXPLICIT_NO_ROUTING_SIGNAL",
    proceedWithInternalExecution: false,
    continueWithLifecycleContext: false,
    continueWithoutLifecycleRecordNonClearance: false,
    failSafeHoldDirective: false,
    explicitNoLifecycleRoutingSignalDirective: true,
    orchestrationDecision
  };
}

export function consumeLauncherCurrentMatterExecutionDirectiveFromOutputCheckpoint(
  input: {
    outputCheckpoint: HydrateOutputCheckpointInput;
    nonLifecycleTransitionInput?: LauncherCurrentMatterNonLifecycleTransitionInput;
  }
): LauncherCurrentMatterExecutionDirective {
  const orchestrationDecision =
    orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint({
      outputCheckpoint: input.outputCheckpoint,
      ...(input.nonLifecycleTransitionInput
        ? { nonLifecycleTransitionInput: input.nonLifecycleTransitionInput }
        : {})
    });

  return consumeLauncherCurrentMatterExecutionDirective({
    orchestrationDecision
  });
}
