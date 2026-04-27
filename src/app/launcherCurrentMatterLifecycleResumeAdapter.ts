import type { Br04LifecycleRouteKind } from "../modules/br04/index.js";
import type { OutputPackageLifecycleResumeCheckpointResult } from "./outputHandoffCheckpointHydration.js";

export const launcherCurrentMatterLifecycleResumeRoutingStatuses = [
  "LIFECYCLE_RESUME_AVAILABLE",
  "LIFECYCLE_RECORD_NOT_FOUND"
] as const;

export type LauncherCurrentMatterLifecycleResumeRoutingStatus =
  (typeof launcherCurrentMatterLifecycleResumeRoutingStatuses)[number];

export interface LauncherCurrentMatterLifecycleResumeRoutingSignalBase {
  status: LauncherCurrentMatterLifecycleResumeRoutingStatus;
  checkpointStatus: OutputPackageLifecycleResumeCheckpointResult["status"];
  clearanceInferred: false;
  resumeRecordKey: string;
  lifecycleResumeRecordPresent: boolean;
  holdAwareLifecycleStatePresent: boolean;
  releaseControlledLifecycleStatePresent: boolean;
  lifecycleRoute: Br04LifecycleRouteKind | "NONE";
  deletionRequestPresent: boolean;
  deidentificationActionPresent: boolean;
  outputPackageLifecycleResume: OutputPackageLifecycleResumeCheckpointResult;
}

export interface LifecycleResumeAvailableRoutingSignal
  extends LauncherCurrentMatterLifecycleResumeRoutingSignalBase {
  status: "LIFECYCLE_RESUME_AVAILABLE";
  checkpointStatus: "RESUMED";
  lifecycleResumeRecordPresent: true;
  lifecycleRoute: Br04LifecycleRouteKind;
  outputPackageLifecycleResume: Extract<
    OutputPackageLifecycleResumeCheckpointResult,
    { status: "RESUMED" }
  >;
}

export interface LifecycleRecordNotFoundRoutingSignal
  extends LauncherCurrentMatterLifecycleResumeRoutingSignalBase {
  status: "LIFECYCLE_RECORD_NOT_FOUND";
  checkpointStatus: "NO_RECORD";
  lifecycleResumeRecordPresent: false;
  lifecycleRoute: "NONE";
  outputPackageLifecycleResume: Extract<
    OutputPackageLifecycleResumeCheckpointResult,
    { status: "NO_RECORD" }
  >;
}

export type LauncherCurrentMatterLifecycleResumeRoutingSignal =
  | LifecycleResumeAvailableRoutingSignal
  | LifecycleRecordNotFoundRoutingSignal;

export function deriveLauncherCurrentMatterLifecycleResumeRoutingSignal(
  outputPackageLifecycleResume: OutputPackageLifecycleResumeCheckpointResult
): LauncherCurrentMatterLifecycleResumeRoutingSignal {
  if (outputPackageLifecycleResume.status === "NO_RECORD") {
    return {
      status: "LIFECYCLE_RECORD_NOT_FOUND",
      checkpointStatus: outputPackageLifecycleResume.status,
      clearanceInferred: false,
      resumeRecordKey: outputPackageLifecycleResume.key,
      lifecycleResumeRecordPresent: false,
      holdAwareLifecycleStatePresent: false,
      releaseControlledLifecycleStatePresent: false,
      lifecycleRoute: "NONE",
      deletionRequestPresent: false,
      deidentificationActionPresent: false,
      outputPackageLifecycleResume
    };
  }

  const holdAwareLifecycleStatePresent = (
    outputPackageLifecycleResume.replayPlan.suppressedByHold
    || outputPackageLifecycleResume.replayPlan.runtimeRecord.activeHoldFlagIds.length > 0
  );
  const releaseControlledLifecycleStatePresent = (
    outputPackageLifecycleResume.replayPlan.runtimeRecord.releasedHoldFlagIds.length > 0
  );

  return {
    status: "LIFECYCLE_RESUME_AVAILABLE",
    checkpointStatus: outputPackageLifecycleResume.status,
    clearanceInferred: false,
    resumeRecordKey: outputPackageLifecycleResume.key,
    lifecycleResumeRecordPresent: true,
    holdAwareLifecycleStatePresent,
    releaseControlledLifecycleStatePresent,
    lifecycleRoute: outputPackageLifecycleResume.replayPlan.route,
    deletionRequestPresent: outputPackageLifecycleResume.replayPlan.deletionRequest !== undefined,
    deidentificationActionPresent: (
      outputPackageLifecycleResume.replayPlan.deidentificationAction !== undefined
    ),
    outputPackageLifecycleResume
  };
}

export function deriveLauncherCurrentMatterLifecycleResumeRoutingSignalFromHydratedCheckpoint(
  input: {
    outputPackageLifecycleResume?: OutputPackageLifecycleResumeCheckpointResult | undefined;
  }
): LauncherCurrentMatterLifecycleResumeRoutingSignal | undefined {
  if (!input.outputPackageLifecycleResume) {
    return undefined;
  }

  return deriveLauncherCurrentMatterLifecycleResumeRoutingSignal(
    input.outputPackageLifecycleResume
  );
}
