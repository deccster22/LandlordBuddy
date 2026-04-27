import type { Br04LifecycleRouteKind } from "../modules/br04/index.js";
import {
  buildOutputPackageLifecycleOrchestrationRecordKey
} from "./outputPackageLifecycleOrchestrationPersistence.js";
import {
  hydrateOfficialHandoffCheckpointForComposition,
  hydrateOutputCheckpointForComposition,
  type HydrateOfficialHandoffCheckpointInput,
  type HydrateOutputCheckpointInput,
  type HydratedOfficialHandoffCheckpointResult,
  type HydratedOutputCheckpointResult
} from "./outputHandoffCheckpointHydration.js";
import type {
  LauncherCurrentMatterLifecycleResumeRoutingSignal
} from "./launcherCurrentMatterLifecycleResumeAdapter.js";

export const launcherCurrentMatterExecutionRoutingOutcomes = [
  "RESUME_AVAILABLE",
  "NO_LIFECYCLE_RECORD_FOUND",
  "CANNOT_SAFELY_RESUME_RECORD"
] as const;

export type LauncherCurrentMatterExecutionRoutingOutcome =
  (typeof launcherCurrentMatterExecutionRoutingOutcomes)[number];

export interface LauncherCurrentMatterExecutionRoutingBase {
  outcome: LauncherCurrentMatterExecutionRoutingOutcome;
  clearanceInferred: false;
  resumeRecordKey?: string;
  lifecycleResumeRecordPresent: boolean;
  holdAwareLifecycleStatePresent: boolean;
  releaseControlledLifecycleStatePresent: boolean;
  lifecycleRoute: Br04LifecycleRouteKind | "NONE";
  lifecycleActionPlanVisible: boolean;
  deletionRequestPresent: boolean;
  deidentificationActionPresent: boolean;
}

export interface ResumeAvailableExecutionRoutingResult
  extends LauncherCurrentMatterExecutionRoutingBase {
  outcome: "RESUME_AVAILABLE";
  resumeRecordKey: string;
  lifecycleResumeRecordPresent: true;
  lifecycleRoute: Br04LifecycleRouteKind;
  lifecycleActionPlanVisible: true;
  launcherCurrentMatterLifecycleResumeRouting: Extract<
    LauncherCurrentMatterLifecycleResumeRoutingSignal,
    { status: "LIFECYCLE_RESUME_AVAILABLE" }
  >;
}

export interface NoLifecycleRecordFoundExecutionRoutingResult
  extends LauncherCurrentMatterExecutionRoutingBase {
  outcome: "NO_LIFECYCLE_RECORD_FOUND";
  resumeRecordKey: string;
  lifecycleResumeRecordPresent: false;
  lifecycleRoute: "NONE";
  lifecycleActionPlanVisible: false;
  launcherCurrentMatterLifecycleResumeRouting: Extract<
    LauncherCurrentMatterLifecycleResumeRoutingSignal,
    { status: "LIFECYCLE_RECORD_NOT_FOUND" }
  >;
}

export interface CannotSafelyResumeRecordExecutionRoutingResult
  extends LauncherCurrentMatterExecutionRoutingBase {
  outcome: "CANNOT_SAFELY_RESUME_RECORD";
  lifecycleResumeRecordPresent: false;
  lifecycleRoute: "NONE";
  lifecycleActionPlanVisible: false;
  malformedLifecycleRecord: true;
  malformedLifecycleRecordErrorMessage: string;
}

export type LauncherCurrentMatterExecutionRoutingResult =
  | ResumeAvailableExecutionRoutingResult
  | NoLifecycleRecordFoundExecutionRoutingResult
  | CannotSafelyResumeRecordExecutionRoutingResult;

export interface ResolveLauncherCurrentMatterExecutionRoutingInput {
  launcherCurrentMatterLifecycleResumeRouting?:
    LauncherCurrentMatterLifecycleResumeRoutingSignal | undefined;
  lifecycleResumeError?: unknown;
  resumeRecordKey?: string;
}

export interface ResolveLauncherCurrentMatterExecutionRoutingFromOutputCheckpointResult {
  executionRouting?: LauncherCurrentMatterExecutionRoutingResult;
  hydratedCheckpoint?: HydratedOutputCheckpointResult;
}

export interface ResolveLauncherCurrentMatterExecutionRoutingFromOfficialHandoffCheckpointResult {
  executionRouting?: LauncherCurrentMatterExecutionRoutingResult;
  hydratedCheckpoint?: HydratedOfficialHandoffCheckpointResult;
}

export function deriveLauncherCurrentMatterExecutionRoutingResult(
  launcherCurrentMatterLifecycleResumeRouting: LauncherCurrentMatterLifecycleResumeRoutingSignal
): ResumeAvailableExecutionRoutingResult | NoLifecycleRecordFoundExecutionRoutingResult {
  if (launcherCurrentMatterLifecycleResumeRouting.status === "LIFECYCLE_RECORD_NOT_FOUND") {
    return {
      outcome: "NO_LIFECYCLE_RECORD_FOUND",
      clearanceInferred: false,
      resumeRecordKey: launcherCurrentMatterLifecycleResumeRouting.resumeRecordKey,
      lifecycleResumeRecordPresent: false,
      holdAwareLifecycleStatePresent: false,
      releaseControlledLifecycleStatePresent: false,
      lifecycleRoute: "NONE",
      lifecycleActionPlanVisible: false,
      deletionRequestPresent: false,
      deidentificationActionPresent: false,
      launcherCurrentMatterLifecycleResumeRouting
    };
  }

  return {
    outcome: "RESUME_AVAILABLE",
    clearanceInferred: false,
    resumeRecordKey: launcherCurrentMatterLifecycleResumeRouting.resumeRecordKey,
    lifecycleResumeRecordPresent: true,
    holdAwareLifecycleStatePresent:
      launcherCurrentMatterLifecycleResumeRouting.holdAwareLifecycleStatePresent,
    releaseControlledLifecycleStatePresent:
      launcherCurrentMatterLifecycleResumeRouting.releaseControlledLifecycleStatePresent,
    lifecycleRoute: launcherCurrentMatterLifecycleResumeRouting.lifecycleRoute,
    lifecycleActionPlanVisible: true,
    deletionRequestPresent:
      launcherCurrentMatterLifecycleResumeRouting.deletionRequestPresent,
    deidentificationActionPresent:
      launcherCurrentMatterLifecycleResumeRouting.deidentificationActionPresent,
    launcherCurrentMatterLifecycleResumeRouting
  };
}

export function deriveCannotSafelyResumeLifecycleRecordExecutionRouting(
  input: {
    error: unknown;
    resumeRecordKey?: string | undefined;
  }
): CannotSafelyResumeRecordExecutionRoutingResult {
  return {
    outcome: "CANNOT_SAFELY_RESUME_RECORD",
    clearanceInferred: false,
    ...(input.resumeRecordKey
      ? { resumeRecordKey: input.resumeRecordKey }
      : {}),
    lifecycleResumeRecordPresent: false,
    holdAwareLifecycleStatePresent: false,
    releaseControlledLifecycleStatePresent: false,
    lifecycleRoute: "NONE",
    lifecycleActionPlanVisible: false,
    deletionRequestPresent: false,
    deidentificationActionPresent: false,
    malformedLifecycleRecord: true,
    malformedLifecycleRecordErrorMessage: deriveErrorMessage(input.error)
  };
}

export function resolveLauncherCurrentMatterExecutionRouting(
  input: ResolveLauncherCurrentMatterExecutionRoutingInput
): LauncherCurrentMatterExecutionRoutingResult | undefined {
  if (input.lifecycleResumeError !== undefined) {
    if (!isMalformedOutputPackageLifecycleResumeError(input.lifecycleResumeError)) {
      throw input.lifecycleResumeError;
    }

    return deriveCannotSafelyResumeLifecycleRecordExecutionRouting({
      error: input.lifecycleResumeError,
      ...(input.resumeRecordKey
        ? { resumeRecordKey: input.resumeRecordKey }
        : {})
    });
  }

  if (!input.launcherCurrentMatterLifecycleResumeRouting) {
    return undefined;
  }

  return deriveLauncherCurrentMatterExecutionRoutingResult(
    input.launcherCurrentMatterLifecycleResumeRouting
  );
}

export function resolveLauncherCurrentMatterExecutionRoutingFromOutputCheckpoint(
  input: HydrateOutputCheckpointInput
): ResolveLauncherCurrentMatterExecutionRoutingFromOutputCheckpointResult {
  const resumeRecordKey = input.outputPackageLifecycleResumeCheckpoint
    ? buildOutputPackageLifecycleOrchestrationRecordKey(
      input.outputPackageLifecycleResumeCheckpoint.locator
    )
    : undefined;

  try {
    const hydratedCheckpoint = hydrateOutputCheckpointForComposition(input);
    const executionRouting = resolveLauncherCurrentMatterExecutionRouting({
      launcherCurrentMatterLifecycleResumeRouting:
        hydratedCheckpoint.launcherCurrentMatterLifecycleResumeRouting
    });

    return {
      ...(executionRouting
        ? { executionRouting }
        : {}),
      hydratedCheckpoint
    };
  } catch (error) {
    const executionRouting = resolveLauncherCurrentMatterExecutionRouting({
      lifecycleResumeError: error,
      ...(resumeRecordKey
        ? { resumeRecordKey }
        : {})
    });

    return {
      ...(executionRouting
        ? { executionRouting }
        : {})
    };
  }
}

export function resolveLauncherCurrentMatterExecutionRoutingFromOfficialHandoffCheckpoint(
  input: HydrateOfficialHandoffCheckpointInput
): ResolveLauncherCurrentMatterExecutionRoutingFromOfficialHandoffCheckpointResult {
  const resumeRecordKey = input.outputPackageLifecycleResumeCheckpoint
    ? buildOutputPackageLifecycleOrchestrationRecordKey(
      input.outputPackageLifecycleResumeCheckpoint.locator
    )
    : undefined;

  try {
    const hydratedCheckpoint = hydrateOfficialHandoffCheckpointForComposition(input);
    const executionRouting = resolveLauncherCurrentMatterExecutionRouting({
      launcherCurrentMatterLifecycleResumeRouting:
        hydratedCheckpoint.launcherCurrentMatterLifecycleResumeRouting
    });

    return {
      ...(executionRouting
        ? { executionRouting }
        : {}),
      hydratedCheckpoint
    };
  } catch (error) {
    const executionRouting = resolveLauncherCurrentMatterExecutionRouting({
      lifecycleResumeError: error,
      ...(resumeRecordKey
        ? { resumeRecordKey }
        : {})
    });

    return {
      ...(executionRouting
        ? { executionRouting }
        : {})
    };
  }
}

export function isMalformedOutputPackageLifecycleResumeError(error: unknown): boolean {
  return error instanceof Error
    && /^Malformed output-package lifecycle orchestration record for key /u.test(error.message);
}

function deriveErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
