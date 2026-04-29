import type { Br04LifecycleRouteKind } from "../modules/br04/index.js";
import {
  resolveLauncherCurrentMatterExecutionControlFromOutputCheckpoint,
  type LauncherCurrentMatterExecutionControlResult
} from "./launcherCurrentMatterExecutionCaller.js";
import type {
  HydrateOutputCheckpointInput
} from "./outputHandoffCheckpointHydration.js";
import type {
  LauncherCurrentMatterExecutionRoutingResult
} from "./launcherCurrentMatterExecutionRouting.js";

export const launcherCurrentMatterFollowOnRouteOutcomes = [
  "CONTINUE_WITH_LIFECYCLE_RESUME_CONTEXT",
  "CONTINUE_WITH_NO_RECORD_NON_CLEARANCE",
  "HOLD_FOR_CANNOT_SAFELY_RESUME",
  "EXPLICIT_NO_LIFECYCLE_ROUTING_SIGNAL"
] as const;

export type LauncherCurrentMatterFollowOnRouteOutcome =
  (typeof launcherCurrentMatterFollowOnRouteOutcomes)[number];

export interface LauncherCurrentMatterFollowOnRouteDecisionBase {
  outcome: LauncherCurrentMatterFollowOnRouteOutcome;
  clearanceInferred: false;
  continueWithLifecycleResumeContext: boolean;
  continueWithNoLifecycleRecordNonClearance: boolean;
  failSafeHandlingRequired: boolean;
  explicitNoLifecycleRoutingSignalHandling: boolean;
  holdAwareLifecycleStatePresent: boolean;
  releaseControlledLifecycleStatePresent: boolean;
  lifecycleRoute: Br04LifecycleRouteKind | "NONE";
  deletionRequestPresent: boolean;
  deidentificationActionPresent: boolean;
  lifecycleExecutionControl: LauncherCurrentMatterExecutionControlResult;
  lifecycleExecutionRouting?: LauncherCurrentMatterExecutionRoutingResult;
}

export interface ContinueWithLifecycleResumeContextDecision
  extends LauncherCurrentMatterFollowOnRouteDecisionBase {
  outcome: "CONTINUE_WITH_LIFECYCLE_RESUME_CONTEXT";
  continueWithLifecycleResumeContext: true;
  continueWithNoLifecycleRecordNonClearance: false;
  failSafeHandlingRequired: false;
  explicitNoLifecycleRoutingSignalHandling: false;
  lifecycleExecutionControl: Extract<
    LauncherCurrentMatterExecutionControlResult,
    { outcome: "RESUME_AVAILABLE_CONTROL" }
  >;
  lifecycleExecutionRouting: Extract<
    LauncherCurrentMatterExecutionRoutingResult,
    { outcome: "RESUME_AVAILABLE" }
  >;
}

export interface ContinueWithNoRecordNonClearanceDecision
  extends LauncherCurrentMatterFollowOnRouteDecisionBase {
  outcome: "CONTINUE_WITH_NO_RECORD_NON_CLEARANCE";
  continueWithLifecycleResumeContext: false;
  continueWithNoLifecycleRecordNonClearance: true;
  failSafeHandlingRequired: false;
  explicitNoLifecycleRoutingSignalHandling: false;
  lifecycleExecutionControl: Extract<
    LauncherCurrentMatterExecutionControlResult,
    { outcome: "NO_RECORD_NON_CLEARANCE_CONTROL" }
  >;
  lifecycleExecutionRouting: Extract<
    LauncherCurrentMatterExecutionRoutingResult,
    { outcome: "NO_LIFECYCLE_RECORD_FOUND" }
  >;
}

export interface HoldForCannotSafelyResumeDecision
  extends LauncherCurrentMatterFollowOnRouteDecisionBase {
  outcome: "HOLD_FOR_CANNOT_SAFELY_RESUME";
  continueWithLifecycleResumeContext: false;
  continueWithNoLifecycleRecordNonClearance: false;
  failSafeHandlingRequired: true;
  explicitNoLifecycleRoutingSignalHandling: false;
  lifecycleExecutionControl: Extract<
    LauncherCurrentMatterExecutionControlResult,
    { outcome: "CANNOT_SAFELY_RESUME_CONTROL" }
  >;
  lifecycleExecutionRouting: Extract<
    LauncherCurrentMatterExecutionRoutingResult,
    { outcome: "CANNOT_SAFELY_RESUME_RECORD" }
  >;
}

export interface ExplicitNoLifecycleRoutingSignalDecision
  extends LauncherCurrentMatterFollowOnRouteDecisionBase {
  outcome: "EXPLICIT_NO_LIFECYCLE_ROUTING_SIGNAL";
  continueWithLifecycleResumeContext: false;
  continueWithNoLifecycleRecordNonClearance: false;
  failSafeHandlingRequired: false;
  explicitNoLifecycleRoutingSignalHandling: true;
  lifecycleExecutionControl: Extract<
    LauncherCurrentMatterExecutionControlResult,
    { outcome: "NO_LIFECYCLE_ROUTING_SIGNAL" }
  >;
}

export type LauncherCurrentMatterFollowOnRouteDecision =
  | ContinueWithLifecycleResumeContextDecision
  | ContinueWithNoRecordNonClearanceDecision
  | HoldForCannotSafelyResumeDecision
  | ExplicitNoLifecycleRoutingSignalDecision;

export function coordinateLauncherCurrentMatterFollowOnRoute(input: {
  lifecycleExecutionControl: LauncherCurrentMatterExecutionControlResult;
}): LauncherCurrentMatterFollowOnRouteDecision {
  const { lifecycleExecutionControl } = input;

  if (lifecycleExecutionControl.outcome === "RESUME_AVAILABLE_CONTROL") {
    return {
      outcome: "CONTINUE_WITH_LIFECYCLE_RESUME_CONTEXT",
      clearanceInferred: false,
      continueWithLifecycleResumeContext: true,
      continueWithNoLifecycleRecordNonClearance: false,
      failSafeHandlingRequired: false,
      explicitNoLifecycleRoutingSignalHandling: false,
      holdAwareLifecycleStatePresent:
        lifecycleExecutionControl.lifecycleExecutionRouting.holdAwareLifecycleStatePresent,
      releaseControlledLifecycleStatePresent:
        lifecycleExecutionControl.lifecycleExecutionRouting.releaseControlledLifecycleStatePresent,
      lifecycleRoute: lifecycleExecutionControl.lifecycleExecutionRouting.lifecycleRoute,
      deletionRequestPresent:
        lifecycleExecutionControl.lifecycleExecutionRouting.deletionRequestPresent,
      deidentificationActionPresent:
        lifecycleExecutionControl.lifecycleExecutionRouting.deidentificationActionPresent,
      lifecycleExecutionControl,
      lifecycleExecutionRouting: lifecycleExecutionControl.lifecycleExecutionRouting
    };
  }

  if (lifecycleExecutionControl.outcome === "NO_RECORD_NON_CLEARANCE_CONTROL") {
    return {
      outcome: "CONTINUE_WITH_NO_RECORD_NON_CLEARANCE",
      clearanceInferred: false,
      continueWithLifecycleResumeContext: false,
      continueWithNoLifecycleRecordNonClearance: true,
      failSafeHandlingRequired: false,
      explicitNoLifecycleRoutingSignalHandling: false,
      holdAwareLifecycleStatePresent: false,
      releaseControlledLifecycleStatePresent: false,
      lifecycleRoute: "NONE",
      deletionRequestPresent: false,
      deidentificationActionPresent: false,
      lifecycleExecutionControl,
      lifecycleExecutionRouting: lifecycleExecutionControl.lifecycleExecutionRouting
    };
  }

  if (lifecycleExecutionControl.outcome === "CANNOT_SAFELY_RESUME_CONTROL") {
    return {
      outcome: "HOLD_FOR_CANNOT_SAFELY_RESUME",
      clearanceInferred: false,
      continueWithLifecycleResumeContext: false,
      continueWithNoLifecycleRecordNonClearance: false,
      failSafeHandlingRequired: true,
      explicitNoLifecycleRoutingSignalHandling: false,
      holdAwareLifecycleStatePresent: false,
      releaseControlledLifecycleStatePresent: false,
      lifecycleRoute: "NONE",
      deletionRequestPresent: false,
      deidentificationActionPresent: false,
      lifecycleExecutionControl,
      lifecycleExecutionRouting: lifecycleExecutionControl.lifecycleExecutionRouting
    };
  }

  return {
    outcome: "EXPLICIT_NO_LIFECYCLE_ROUTING_SIGNAL",
    clearanceInferred: false,
    continueWithLifecycleResumeContext: false,
    continueWithNoLifecycleRecordNonClearance: false,
    failSafeHandlingRequired: false,
    explicitNoLifecycleRoutingSignalHandling: true,
    holdAwareLifecycleStatePresent: false,
    releaseControlledLifecycleStatePresent: false,
    lifecycleRoute: "NONE",
    deletionRequestPresent: false,
    deidentificationActionPresent: false,
    lifecycleExecutionControl
  };
}

export function coordinateLauncherCurrentMatterFollowOnRouteFromOutputCheckpoint(
  input: HydrateOutputCheckpointInput
): LauncherCurrentMatterFollowOnRouteDecision {
  const lifecycleExecutionControl =
    resolveLauncherCurrentMatterExecutionControlFromOutputCheckpoint(input);

  return coordinateLauncherCurrentMatterFollowOnRoute({
    lifecycleExecutionControl
  });
}
