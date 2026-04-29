import {
  resolveLauncherCurrentMatterExecutionRoutingFromOutputCheckpoint,
  type LauncherCurrentMatterExecutionRoutingResult
} from "./launcherCurrentMatterExecutionRouting.js";
import type {
  HydrateOutputCheckpointInput,
  HydratedOutputCheckpointResult
} from "./outputHandoffCheckpointHydration.js";

export const launcherCurrentMatterExecutionControlOutcomes = [
  "RESUME_AVAILABLE_CONTROL",
  "NO_RECORD_NON_CLEARANCE_CONTROL",
  "CANNOT_SAFELY_RESUME_CONTROL",
  "NO_LIFECYCLE_ROUTING_SIGNAL"
] as const;

export type LauncherCurrentMatterExecutionControlOutcome =
  (typeof launcherCurrentMatterExecutionControlOutcomes)[number];

export interface LauncherCurrentMatterExecutionControlResultBase {
  outcome: LauncherCurrentMatterExecutionControlOutcome;
  clearanceInferred: false;
  resumeContinuationAllowed: boolean;
  continueWithoutLifecycleRecord: boolean;
  failSafeInterventionRequired: boolean;
  hydratedCheckpoint?: HydratedOutputCheckpointResult;
  lifecycleExecutionRouting?: LauncherCurrentMatterExecutionRoutingResult;
}

export interface ResumeAvailableControlResult
  extends LauncherCurrentMatterExecutionControlResultBase {
  outcome: "RESUME_AVAILABLE_CONTROL";
  resumeContinuationAllowed: true;
  continueWithoutLifecycleRecord: false;
  failSafeInterventionRequired: false;
  lifecycleExecutionRouting: Extract<
    LauncherCurrentMatterExecutionRoutingResult,
    { outcome: "RESUME_AVAILABLE" }
  >;
}

export interface NoRecordNonClearanceControlResult
  extends LauncherCurrentMatterExecutionControlResultBase {
  outcome: "NO_RECORD_NON_CLEARANCE_CONTROL";
  resumeContinuationAllowed: false;
  continueWithoutLifecycleRecord: true;
  failSafeInterventionRequired: false;
  lifecycleExecutionRouting: Extract<
    LauncherCurrentMatterExecutionRoutingResult,
    { outcome: "NO_LIFECYCLE_RECORD_FOUND" }
  >;
}

export interface CannotSafelyResumeControlResult
  extends LauncherCurrentMatterExecutionControlResultBase {
  outcome: "CANNOT_SAFELY_RESUME_CONTROL";
  resumeContinuationAllowed: false;
  continueWithoutLifecycleRecord: false;
  failSafeInterventionRequired: true;
  lifecycleExecutionRouting: Extract<
    LauncherCurrentMatterExecutionRoutingResult,
    { outcome: "CANNOT_SAFELY_RESUME_RECORD" }
  >;
}

export interface NoLifecycleRoutingSignalControlResult
  extends LauncherCurrentMatterExecutionControlResultBase {
  outcome: "NO_LIFECYCLE_ROUTING_SIGNAL";
  resumeContinuationAllowed: false;
  continueWithoutLifecycleRecord: false;
  failSafeInterventionRequired: false;
}

export type LauncherCurrentMatterExecutionControlResult =
  | ResumeAvailableControlResult
  | NoRecordNonClearanceControlResult
  | CannotSafelyResumeControlResult
  | NoLifecycleRoutingSignalControlResult;

export function resolveLauncherCurrentMatterExecutionControlFromOutputCheckpoint(
  input: HydrateOutputCheckpointInput
): LauncherCurrentMatterExecutionControlResult {
  const resolved = resolveLauncherCurrentMatterExecutionRoutingFromOutputCheckpoint(input);
  const executionRouting = resolved.executionRouting;

  if (!executionRouting) {
    return {
      outcome: "NO_LIFECYCLE_ROUTING_SIGNAL",
      clearanceInferred: false,
      resumeContinuationAllowed: false,
      continueWithoutLifecycleRecord: false,
      failSafeInterventionRequired: false,
      ...(resolved.hydratedCheckpoint
        ? { hydratedCheckpoint: resolved.hydratedCheckpoint }
        : {})
    };
  }

  if (executionRouting.outcome === "RESUME_AVAILABLE") {
    return {
      outcome: "RESUME_AVAILABLE_CONTROL",
      clearanceInferred: false,
      resumeContinuationAllowed: true,
      continueWithoutLifecycleRecord: false,
      failSafeInterventionRequired: false,
      lifecycleExecutionRouting: executionRouting,
      ...(resolved.hydratedCheckpoint
        ? { hydratedCheckpoint: resolved.hydratedCheckpoint }
        : {})
    };
  }

  if (executionRouting.outcome === "NO_LIFECYCLE_RECORD_FOUND") {
    return {
      outcome: "NO_RECORD_NON_CLEARANCE_CONTROL",
      clearanceInferred: false,
      resumeContinuationAllowed: false,
      continueWithoutLifecycleRecord: true,
      failSafeInterventionRequired: false,
      lifecycleExecutionRouting: executionRouting,
      ...(resolved.hydratedCheckpoint
        ? { hydratedCheckpoint: resolved.hydratedCheckpoint }
        : {})
    };
  }

  return {
    outcome: "CANNOT_SAFELY_RESUME_CONTROL",
    clearanceInferred: false,
    resumeContinuationAllowed: false,
    continueWithoutLifecycleRecord: false,
    failSafeInterventionRequired: true,
    lifecycleExecutionRouting: executionRouting
  };
}
