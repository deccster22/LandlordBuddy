import type { Br04LifecycleRouteKind } from "../modules/br04/index.js";
import {
  consumeLauncherCurrentMatterExecutionDirectiveFromOutputCheckpoint,
  type LauncherCurrentMatterExecutionDirective
} from "./launcherCurrentMatterExecutionDirectiveConsumer.js";
import type {
  HydrateOutputCheckpointInput
} from "./outputHandoffCheckpointHydration.js";
import type {
  LauncherCurrentMatterNonLifecycleTransitionInput,
  LauncherCurrentMatterNonLifecycleTransitionState
} from "./launcherCurrentMatterTransitionOrchestrationEntry.js";
import type {
  LauncherCurrentMatterTransitionSelection
} from "./launcherCurrentMatterTransitionSelector.js";

export const launcherCurrentMatterInternalHandlingActionOutcomes = [
  "ACTION_CONTINUE_INTERNAL_WITH_LIFECYCLE_CONTEXT",
  "ACTION_CONTINUE_INTERNAL_NO_RECORD_NON_CLEARANCE",
  "ACTION_HOLD_INTERNAL_CANNOT_SAFELY_RESUME",
  "ACTION_EXPLICIT_INTERNAL_NO_ROUTING_SIGNAL"
] as const;

export type LauncherCurrentMatterInternalHandlingActionOutcome =
  (typeof launcherCurrentMatterInternalHandlingActionOutcomes)[number];

export interface LauncherCurrentMatterInternalHandlingActionBase {
  handlingAction: LauncherCurrentMatterInternalHandlingActionOutcome;
  clearanceInferred: false;
  proceedWithInternalHandling: boolean;
  continueInternalWithLifecycleContext: boolean;
  continueInternalNoRecordNonClearance: boolean;
  failSafeHoldInternalHandling: boolean;
  explicitNoRoutingSignalInternalHandling: boolean;
  lifecycleRoute: Br04LifecycleRouteKind | "NONE";
  holdAwareLifecycleStatePresent: boolean;
  releaseControlledLifecycleStatePresent: boolean;
  deletionRequestPresent: boolean;
  deidentificationActionPresent: boolean;
  nonLifecycleHoldRequested: boolean;
  lifecycleTransitionState: LauncherCurrentMatterTransitionSelection;
  nonLifecycleTransitionState: LauncherCurrentMatterNonLifecycleTransitionState;
  executionDirective: LauncherCurrentMatterExecutionDirective;
}

export interface ContinueInternalWithLifecycleContextHandlingAction
  extends LauncherCurrentMatterInternalHandlingActionBase {
  handlingAction: "ACTION_CONTINUE_INTERNAL_WITH_LIFECYCLE_CONTEXT";
  continueInternalWithLifecycleContext: true;
  continueInternalNoRecordNonClearance: false;
  failSafeHoldInternalHandling: false;
  explicitNoRoutingSignalInternalHandling: false;
  executionDirective: Extract<
    LauncherCurrentMatterExecutionDirective,
    { directive: "DIRECTIVE_CONTINUE_WITH_LIFECYCLE_CONTEXT" }
  >;
}

export interface ContinueInternalNoRecordNonClearanceHandlingAction
  extends LauncherCurrentMatterInternalHandlingActionBase {
  handlingAction: "ACTION_CONTINUE_INTERNAL_NO_RECORD_NON_CLEARANCE";
  continueInternalWithLifecycleContext: false;
  continueInternalNoRecordNonClearance: true;
  failSafeHoldInternalHandling: false;
  explicitNoRoutingSignalInternalHandling: false;
  executionDirective: Extract<
    LauncherCurrentMatterExecutionDirective,
    { directive: "DIRECTIVE_CONTINUE_NO_RECORD_NON_CLEARANCE" }
  >;
}

export interface HoldInternalCannotSafelyResumeHandlingAction
  extends LauncherCurrentMatterInternalHandlingActionBase {
  handlingAction: "ACTION_HOLD_INTERNAL_CANNOT_SAFELY_RESUME";
  proceedWithInternalHandling: false;
  continueInternalWithLifecycleContext: false;
  continueInternalNoRecordNonClearance: false;
  failSafeHoldInternalHandling: true;
  explicitNoRoutingSignalInternalHandling: false;
  executionDirective: Extract<
    LauncherCurrentMatterExecutionDirective,
    { directive: "DIRECTIVE_HOLD_CANNOT_SAFELY_RESUME" }
  >;
}

export interface ExplicitInternalNoRoutingSignalHandlingAction
  extends LauncherCurrentMatterInternalHandlingActionBase {
  handlingAction: "ACTION_EXPLICIT_INTERNAL_NO_ROUTING_SIGNAL";
  proceedWithInternalHandling: false;
  continueInternalWithLifecycleContext: false;
  continueInternalNoRecordNonClearance: false;
  failSafeHoldInternalHandling: false;
  explicitNoRoutingSignalInternalHandling: true;
  executionDirective: Extract<
    LauncherCurrentMatterExecutionDirective,
    { directive: "DIRECTIVE_EXPLICIT_NO_ROUTING_SIGNAL" }
  >;
}

export type LauncherCurrentMatterInternalHandlingAction =
  | ContinueInternalWithLifecycleContextHandlingAction
  | ContinueInternalNoRecordNonClearanceHandlingAction
  | HoldInternalCannotSafelyResumeHandlingAction
  | ExplicitInternalNoRoutingSignalHandlingAction;

export function consumeLauncherCurrentMatterInternalHandlingAction(input: {
  executionDirective: LauncherCurrentMatterExecutionDirective;
}): LauncherCurrentMatterInternalHandlingAction {
  const { executionDirective } = input;
  const common = {
    clearanceInferred: false as const,
    proceedWithInternalHandling: executionDirective.proceedWithInternalExecution,
    lifecycleRoute: executionDirective.lifecycleRoute,
    holdAwareLifecycleStatePresent: executionDirective.holdAwareLifecycleStatePresent,
    releaseControlledLifecycleStatePresent:
      executionDirective.releaseControlledLifecycleStatePresent,
    deletionRequestPresent: executionDirective.deletionRequestPresent,
    deidentificationActionPresent: executionDirective.deidentificationActionPresent,
    nonLifecycleHoldRequested: executionDirective.nonLifecycleHoldRequested,
    lifecycleTransitionState: executionDirective.lifecycleTransitionState,
    nonLifecycleTransitionState: executionDirective.nonLifecycleTransitionState
  };

  if (executionDirective.directive === "DIRECTIVE_CONTINUE_WITH_LIFECYCLE_CONTEXT") {
    return {
      handlingAction: "ACTION_CONTINUE_INTERNAL_WITH_LIFECYCLE_CONTEXT",
      continueInternalWithLifecycleContext: true,
      continueInternalNoRecordNonClearance: false,
      failSafeHoldInternalHandling: false,
      explicitNoRoutingSignalInternalHandling: false,
      executionDirective,
      ...common
    };
  }

  if (executionDirective.directive === "DIRECTIVE_CONTINUE_NO_RECORD_NON_CLEARANCE") {
    return {
      handlingAction: "ACTION_CONTINUE_INTERNAL_NO_RECORD_NON_CLEARANCE",
      continueInternalWithLifecycleContext: false,
      continueInternalNoRecordNonClearance: true,
      failSafeHoldInternalHandling: false,
      explicitNoRoutingSignalInternalHandling: false,
      executionDirective,
      ...common
    };
  }

  if (executionDirective.directive === "DIRECTIVE_HOLD_CANNOT_SAFELY_RESUME") {
    return {
      ...common,
      handlingAction: "ACTION_HOLD_INTERNAL_CANNOT_SAFELY_RESUME",
      proceedWithInternalHandling: false,
      continueInternalWithLifecycleContext: false,
      continueInternalNoRecordNonClearance: false,
      failSafeHoldInternalHandling: true,
      explicitNoRoutingSignalInternalHandling: false,
      executionDirective
    };
  }

  return {
    ...common,
    handlingAction: "ACTION_EXPLICIT_INTERNAL_NO_ROUTING_SIGNAL",
    proceedWithInternalHandling: false,
    continueInternalWithLifecycleContext: false,
    continueInternalNoRecordNonClearance: false,
    failSafeHoldInternalHandling: false,
    explicitNoRoutingSignalInternalHandling: true,
    executionDirective
  };
}

export function consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint(
  input: {
    outputCheckpoint: HydrateOutputCheckpointInput;
    nonLifecycleTransitionInput?: LauncherCurrentMatterNonLifecycleTransitionInput;
  }
): LauncherCurrentMatterInternalHandlingAction {
  const executionDirective =
    consumeLauncherCurrentMatterExecutionDirectiveFromOutputCheckpoint({
      outputCheckpoint: input.outputCheckpoint,
      ...(input.nonLifecycleTransitionInput
        ? { nonLifecycleTransitionInput: input.nonLifecycleTransitionInput }
        : {})
    });

  return consumeLauncherCurrentMatterInternalHandlingAction({
    executionDirective
  });
}
