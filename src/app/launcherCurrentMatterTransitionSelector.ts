import type { Br04LifecycleRouteKind } from "../modules/br04/index.js";
import type { LauncherCurrentMatterExecutionControlResult } from "./launcherCurrentMatterExecutionCaller.js";
import {
  coordinateLauncherCurrentMatterFollowOnRouteFromOutputCheckpoint,
  type LauncherCurrentMatterFollowOnRouteDecision
} from "./launcherCurrentMatterFollowOnRouteCoordinator.js";
import type {
  HydrateOutputCheckpointInput
} from "./outputHandoffCheckpointHydration.js";
import type {
  LauncherCurrentMatterExecutionRoutingResult
} from "./launcherCurrentMatterExecutionRouting.js";

export const launcherCurrentMatterInternalTransitionTargets = [
  "TRANSITION_CONTINUE_WITH_LIFECYCLE_CONTEXT",
  "TRANSITION_CONTINUE_NO_RECORD_NON_CLEARANCE",
  "TRANSITION_HOLD_CANNOT_SAFELY_RESUME",
  "TRANSITION_EXPLICIT_NO_ROUTING_SIGNAL"
] as const;

export type LauncherCurrentMatterInternalTransitionTarget =
  (typeof launcherCurrentMatterInternalTransitionTargets)[number];

export const launcherCurrentMatterInternalTransitionHandlingModes = [
  "MODE_CONTINUE_WITH_LIFECYCLE_CONTEXT",
  "MODE_CONTINUE_WITH_NO_RECORD_NON_CLEARANCE",
  "MODE_HOLD_CANNOT_SAFELY_RESUME",
  "MODE_EXPLICIT_NO_ROUTING_SIGNAL"
] as const;

export type LauncherCurrentMatterInternalTransitionHandlingMode =
  (typeof launcherCurrentMatterInternalTransitionHandlingModes)[number];

export interface LauncherCurrentMatterTransitionSelectionBase {
  target: LauncherCurrentMatterInternalTransitionTarget;
  handlingMode: LauncherCurrentMatterInternalTransitionHandlingMode;
  clearanceInferred: false;
  proceedWithInternalTransition: boolean;
  noRecordNonClearanceHandling: boolean;
  failSafeHoldHandling: boolean;
  explicitNoRoutingSignalHandling: boolean;
  holdAwareLifecycleStatePresent: boolean;
  releaseControlledLifecycleStatePresent: boolean;
  lifecycleRoute: Br04LifecycleRouteKind | "NONE";
  deletionRequestPresent: boolean;
  deidentificationActionPresent: boolean;
  coordinatorDecision: LauncherCurrentMatterFollowOnRouteDecision;
  lifecycleExecutionControl: LauncherCurrentMatterExecutionControlResult;
  lifecycleExecutionRouting?: LauncherCurrentMatterExecutionRoutingResult;
}

export interface ContinueWithLifecycleContextTransitionSelection
  extends LauncherCurrentMatterTransitionSelectionBase {
  target: "TRANSITION_CONTINUE_WITH_LIFECYCLE_CONTEXT";
  handlingMode: "MODE_CONTINUE_WITH_LIFECYCLE_CONTEXT";
  proceedWithInternalTransition: true;
  noRecordNonClearanceHandling: false;
  failSafeHoldHandling: false;
  explicitNoRoutingSignalHandling: false;
  coordinatorDecision: Extract<
    LauncherCurrentMatterFollowOnRouteDecision,
    { outcome: "CONTINUE_WITH_LIFECYCLE_RESUME_CONTEXT" }
  >;
  lifecycleExecutionControl: Extract<
    LauncherCurrentMatterExecutionControlResult,
    { outcome: "RESUME_AVAILABLE_CONTROL" }
  >;
  lifecycleExecutionRouting: Extract<
    LauncherCurrentMatterExecutionRoutingResult,
    { outcome: "RESUME_AVAILABLE" }
  >;
}

export interface ContinueNoRecordNonClearanceTransitionSelection
  extends LauncherCurrentMatterTransitionSelectionBase {
  target: "TRANSITION_CONTINUE_NO_RECORD_NON_CLEARANCE";
  handlingMode: "MODE_CONTINUE_WITH_NO_RECORD_NON_CLEARANCE";
  proceedWithInternalTransition: true;
  noRecordNonClearanceHandling: true;
  failSafeHoldHandling: false;
  explicitNoRoutingSignalHandling: false;
  coordinatorDecision: Extract<
    LauncherCurrentMatterFollowOnRouteDecision,
    { outcome: "CONTINUE_WITH_NO_RECORD_NON_CLEARANCE" }
  >;
  lifecycleExecutionControl: Extract<
    LauncherCurrentMatterExecutionControlResult,
    { outcome: "NO_RECORD_NON_CLEARANCE_CONTROL" }
  >;
  lifecycleExecutionRouting: Extract<
    LauncherCurrentMatterExecutionRoutingResult,
    { outcome: "NO_LIFECYCLE_RECORD_FOUND" }
  >;
}

export interface HoldCannotSafelyResumeTransitionSelection
  extends LauncherCurrentMatterTransitionSelectionBase {
  target: "TRANSITION_HOLD_CANNOT_SAFELY_RESUME";
  handlingMode: "MODE_HOLD_CANNOT_SAFELY_RESUME";
  proceedWithInternalTransition: false;
  noRecordNonClearanceHandling: false;
  failSafeHoldHandling: true;
  explicitNoRoutingSignalHandling: false;
  coordinatorDecision: Extract<
    LauncherCurrentMatterFollowOnRouteDecision,
    { outcome: "HOLD_FOR_CANNOT_SAFELY_RESUME" }
  >;
  lifecycleExecutionControl: Extract<
    LauncherCurrentMatterExecutionControlResult,
    { outcome: "CANNOT_SAFELY_RESUME_CONTROL" }
  >;
  lifecycleExecutionRouting: Extract<
    LauncherCurrentMatterExecutionRoutingResult,
    { outcome: "CANNOT_SAFELY_RESUME_RECORD" }
  >;
}

export interface ExplicitNoRoutingSignalTransitionSelection
  extends LauncherCurrentMatterTransitionSelectionBase {
  target: "TRANSITION_EXPLICIT_NO_ROUTING_SIGNAL";
  handlingMode: "MODE_EXPLICIT_NO_ROUTING_SIGNAL";
  proceedWithInternalTransition: false;
  noRecordNonClearanceHandling: false;
  failSafeHoldHandling: false;
  explicitNoRoutingSignalHandling: true;
  coordinatorDecision: Extract<
    LauncherCurrentMatterFollowOnRouteDecision,
    { outcome: "EXPLICIT_NO_LIFECYCLE_ROUTING_SIGNAL" }
  >;
  lifecycleExecutionControl: Extract<
    LauncherCurrentMatterExecutionControlResult,
    { outcome: "NO_LIFECYCLE_ROUTING_SIGNAL" }
  >;
}

export type LauncherCurrentMatterTransitionSelection =
  | ContinueWithLifecycleContextTransitionSelection
  | ContinueNoRecordNonClearanceTransitionSelection
  | HoldCannotSafelyResumeTransitionSelection
  | ExplicitNoRoutingSignalTransitionSelection;

export function selectLauncherCurrentMatterInternalTransition(input: {
  coordinatorDecision: LauncherCurrentMatterFollowOnRouteDecision;
}): LauncherCurrentMatterTransitionSelection {
  const { coordinatorDecision } = input;

  if (coordinatorDecision.outcome === "CONTINUE_WITH_LIFECYCLE_RESUME_CONTEXT") {
    return {
      target: "TRANSITION_CONTINUE_WITH_LIFECYCLE_CONTEXT",
      handlingMode: "MODE_CONTINUE_WITH_LIFECYCLE_CONTEXT",
      clearanceInferred: false,
      proceedWithInternalTransition: true,
      noRecordNonClearanceHandling: false,
      failSafeHoldHandling: false,
      explicitNoRoutingSignalHandling: false,
      holdAwareLifecycleStatePresent: coordinatorDecision.holdAwareLifecycleStatePresent,
      releaseControlledLifecycleStatePresent:
        coordinatorDecision.releaseControlledLifecycleStatePresent,
      lifecycleRoute: coordinatorDecision.lifecycleRoute,
      deletionRequestPresent: coordinatorDecision.deletionRequestPresent,
      deidentificationActionPresent: coordinatorDecision.deidentificationActionPresent,
      coordinatorDecision,
      lifecycleExecutionControl: coordinatorDecision.lifecycleExecutionControl,
      lifecycleExecutionRouting: coordinatorDecision.lifecycleExecutionRouting
    };
  }

  if (coordinatorDecision.outcome === "CONTINUE_WITH_NO_RECORD_NON_CLEARANCE") {
    return {
      target: "TRANSITION_CONTINUE_NO_RECORD_NON_CLEARANCE",
      handlingMode: "MODE_CONTINUE_WITH_NO_RECORD_NON_CLEARANCE",
      clearanceInferred: false,
      proceedWithInternalTransition: true,
      noRecordNonClearanceHandling: true,
      failSafeHoldHandling: false,
      explicitNoRoutingSignalHandling: false,
      holdAwareLifecycleStatePresent: false,
      releaseControlledLifecycleStatePresent: false,
      lifecycleRoute: "NONE",
      deletionRequestPresent: false,
      deidentificationActionPresent: false,
      coordinatorDecision,
      lifecycleExecutionControl: coordinatorDecision.lifecycleExecutionControl,
      lifecycleExecutionRouting: coordinatorDecision.lifecycleExecutionRouting
    };
  }

  if (coordinatorDecision.outcome === "HOLD_FOR_CANNOT_SAFELY_RESUME") {
    return {
      target: "TRANSITION_HOLD_CANNOT_SAFELY_RESUME",
      handlingMode: "MODE_HOLD_CANNOT_SAFELY_RESUME",
      clearanceInferred: false,
      proceedWithInternalTransition: false,
      noRecordNonClearanceHandling: false,
      failSafeHoldHandling: true,
      explicitNoRoutingSignalHandling: false,
      holdAwareLifecycleStatePresent: false,
      releaseControlledLifecycleStatePresent: false,
      lifecycleRoute: "NONE",
      deletionRequestPresent: false,
      deidentificationActionPresent: false,
      coordinatorDecision,
      lifecycleExecutionControl: coordinatorDecision.lifecycleExecutionControl,
      lifecycleExecutionRouting: coordinatorDecision.lifecycleExecutionRouting
    };
  }

  return {
    target: "TRANSITION_EXPLICIT_NO_ROUTING_SIGNAL",
    handlingMode: "MODE_EXPLICIT_NO_ROUTING_SIGNAL",
    clearanceInferred: false,
    proceedWithInternalTransition: false,
    noRecordNonClearanceHandling: false,
    failSafeHoldHandling: false,
    explicitNoRoutingSignalHandling: true,
    holdAwareLifecycleStatePresent: false,
    releaseControlledLifecycleStatePresent: false,
    lifecycleRoute: "NONE",
    deletionRequestPresent: false,
    deidentificationActionPresent: false,
    coordinatorDecision,
    lifecycleExecutionControl: coordinatorDecision.lifecycleExecutionControl
  };
}

export function selectLauncherCurrentMatterInternalTransitionFromOutputCheckpoint(
  input: HydrateOutputCheckpointInput
): LauncherCurrentMatterTransitionSelection {
  const coordinatorDecision =
    coordinateLauncherCurrentMatterFollowOnRouteFromOutputCheckpoint(input);

  return selectLauncherCurrentMatterInternalTransition({
    coordinatorDecision
  });
}
