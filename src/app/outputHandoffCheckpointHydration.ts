import {
  buildOfficialHandoffGuidanceShell,
  type OfficialHandoffGuidanceInput,
  type OfficialHandoffGuidanceShell
} from "../modules/handoff/index.js";
import type { PrivacyAuditEvent } from "../domain/model.js";
import type { Br04LifecycleActionPlan, Br04PolicySource } from "../modules/br04/index.js";
import {
  generateOutputPackageShell,
  type OutputPackageShell,
  type OutputSelectionInput
} from "../modules/output/index.js";
import {
  buildBr03TouchpointPostureSnapshots,
  type Br03TouchpointPostureSourceEvent,
  type Br03TouchpointSnapshotProductionResult
} from "./br03TouchpointSnapshotProducer.js";
import {
  replayOutputPackageLifecycleOrchestration,
  type OutputPackageLifecycleOrchestrationRecord
} from "./outputPackageLifecycleOrchestration.js";
import {
  buildOutputPackageLifecycleOrchestrationRecordKey,
  loadOutputPackageLifecycleOrchestrationRecord,
  type OutputPackageLifecycleOrchestrationRecordLocator,
  type OutputPackageLifecycleOrchestrationRecordStore
} from "./outputPackageLifecycleOrchestrationPersistence.js";

export interface OutputPackageLifecycleResumeCheckpointInput {
  store: OutputPackageLifecycleOrchestrationRecordStore;
  locator: OutputPackageLifecycleOrchestrationRecordLocator;
  source?: Br04PolicySource | undefined;
}

interface OutputPackageLifecycleResumeCheckpointBase {
  key: string;
  clearanceInferred: false;
  auditEvents: PrivacyAuditEvent[];
}

export interface ResumedOutputPackageLifecycleResumeCheckpointResult
  extends OutputPackageLifecycleResumeCheckpointBase {
  status: "RESUMED";
  orchestrationRecord: OutputPackageLifecycleOrchestrationRecord;
  replayPlan: Br04LifecycleActionPlan;
}

export interface MissingOutputPackageLifecycleResumeCheckpointResult
  extends OutputPackageLifecycleResumeCheckpointBase {
  status: "NO_RECORD";
}

export type OutputPackageLifecycleResumeCheckpointResult =
  | ResumedOutputPackageLifecycleResumeCheckpointResult
  | MissingOutputPackageLifecycleResumeCheckpointResult;

export interface HydrateOutputCheckpointInput
  extends Omit<OutputSelectionInput, "touchpointPostureSnapshots"> {
  out04TouchpointSourceEvents?: readonly Br03TouchpointPostureSourceEvent[];
  outputPackageLifecycleResumeCheckpoint?: OutputPackageLifecycleResumeCheckpointInput;
}

export interface HydrateOfficialHandoffCheckpointInput
  extends Omit<OfficialHandoffGuidanceInput, "touchpointPostureSnapshots"> {
  out04TouchpointSourceEvents?: readonly Br03TouchpointPostureSourceEvent[];
  outputPackageLifecycleResumeCheckpoint?: OutputPackageLifecycleResumeCheckpointInput;
}

export interface HydratedOutputCheckpointResult {
  outputSelectionInput: OutputSelectionInput;
  touchpointSnapshotProduction: Br03TouchpointSnapshotProductionResult;
  outputPackageLifecycleResume?: OutputPackageLifecycleResumeCheckpointResult;
}

export interface HydratedOfficialHandoffCheckpointResult {
  officialHandoffInput: OfficialHandoffGuidanceInput;
  touchpointSnapshotProduction: Br03TouchpointSnapshotProductionResult;
  outputPackageLifecycleResume?: OutputPackageLifecycleResumeCheckpointResult;
}

export interface HydratedOutputCompositionResult {
  outputPackage: OutputPackageShell;
  touchpointSnapshotProduction: Br03TouchpointSnapshotProductionResult;
  outputPackageLifecycleResume?: OutputPackageLifecycleResumeCheckpointResult;
}

export interface HydratedOfficialHandoffCompositionResult {
  guidance: OfficialHandoffGuidanceShell;
  touchpointSnapshotProduction: Br03TouchpointSnapshotProductionResult;
  outputPackageLifecycleResume?: OutputPackageLifecycleResumeCheckpointResult;
}

export function resumeOutputPackageLifecycleOrchestrationForCheckpoint(
  input: OutputPackageLifecycleResumeCheckpointInput
): OutputPackageLifecycleResumeCheckpointResult {
  const key = buildOutputPackageLifecycleOrchestrationRecordKey(input.locator);
  let orchestrationRecord: OutputPackageLifecycleOrchestrationRecord;

  try {
    orchestrationRecord = loadOutputPackageLifecycleOrchestrationRecord({
      store: input.store,
      key
    });
  } catch (error) {
    if (isMissingOutputPackageLifecycleOrchestrationRecordError(error)) {
      return {
        status: "NO_RECORD",
        key,
        clearanceInferred: false,
        auditEvents: []
      };
    }

    throw error;
  }

  const replayPlan = replayOutputPackageLifecycleOrchestration({
    orchestrationRecord,
    source: input.source
  });

  return {
    status: "RESUMED",
    key,
    clearanceInferred: false,
    orchestrationRecord: cloneUnknown(orchestrationRecord),
    replayPlan: cloneUnknown(replayPlan),
    auditEvents: cloneUnknown(orchestrationRecord.auditEvents)
  };
}

export function hydrateOutputCheckpointForComposition(
  input: HydrateOutputCheckpointInput
): HydratedOutputCheckpointResult {
  const {
    out04TouchpointSourceEvents,
    outputPackageLifecycleResumeCheckpoint,
    ...outputSelectionInputWithoutSnapshots
  } = input;
  const touchpointSnapshotProduction = buildBr03TouchpointPostureSnapshots({
    forumPath: outputSelectionInputWithoutSnapshots.forumPath,
    ...(outputSelectionInputWithoutSnapshots.touchpointIds
      ? { touchpointIds: outputSelectionInputWithoutSnapshots.touchpointIds }
      : {}),
    ...(out04TouchpointSourceEvents
      ? { sourceEvents: out04TouchpointSourceEvents }
      : {})
  });
  const outputPackageLifecycleResume = outputPackageLifecycleResumeCheckpoint
    ? resumeOutputPackageLifecycleOrchestrationForCheckpoint(
      outputPackageLifecycleResumeCheckpoint
    )
    : undefined;

  return {
    outputSelectionInput: {
      ...outputSelectionInputWithoutSnapshots,
      touchpointPostureSnapshots: touchpointSnapshotProduction.snapshots
    },
    touchpointSnapshotProduction,
    ...(outputPackageLifecycleResume
      ? { outputPackageLifecycleResume }
      : {})
  };
}

export function hydrateOfficialHandoffCheckpointForComposition(
  input: HydrateOfficialHandoffCheckpointInput
): HydratedOfficialHandoffCheckpointResult {
  const {
    out04TouchpointSourceEvents,
    outputPackageLifecycleResumeCheckpoint,
    ...officialHandoffInputWithoutSnapshots
  } = input;
  const touchpointSnapshotProduction = buildBr03TouchpointPostureSnapshots({
    forumPath: officialHandoffInputWithoutSnapshots.forumPath,
    ...(officialHandoffInputWithoutSnapshots.touchpointIds
      ? { touchpointIds: officialHandoffInputWithoutSnapshots.touchpointIds }
      : {}),
    ...(out04TouchpointSourceEvents
      ? { sourceEvents: out04TouchpointSourceEvents }
      : {})
  });
  const outputPackageLifecycleResume = outputPackageLifecycleResumeCheckpoint
    ? resumeOutputPackageLifecycleOrchestrationForCheckpoint(
      outputPackageLifecycleResumeCheckpoint
    )
    : undefined;

  return {
    officialHandoffInput: {
      ...officialHandoffInputWithoutSnapshots,
      touchpointPostureSnapshots: touchpointSnapshotProduction.snapshots
    },
    touchpointSnapshotProduction,
    ...(outputPackageLifecycleResume
      ? { outputPackageLifecycleResume }
      : {})
  };
}

export function composeOutputPackageFromHydratedCheckpoint(
  input: HydrateOutputCheckpointInput
): HydratedOutputCompositionResult {
  const hydrated = hydrateOutputCheckpointForComposition(input);

  return {
    outputPackage: generateOutputPackageShell(hydrated.outputSelectionInput),
    touchpointSnapshotProduction: hydrated.touchpointSnapshotProduction,
    ...(hydrated.outputPackageLifecycleResume
      ? { outputPackageLifecycleResume: hydrated.outputPackageLifecycleResume }
      : {})
  };
}

export function composeOfficialHandoffGuidanceFromHydratedCheckpoint(
  input: HydrateOfficialHandoffCheckpointInput
): HydratedOfficialHandoffCompositionResult {
  const hydrated = hydrateOfficialHandoffCheckpointForComposition(input);

  return {
    guidance: buildOfficialHandoffGuidanceShell(hydrated.officialHandoffInput),
    touchpointSnapshotProduction: hydrated.touchpointSnapshotProduction,
    ...(hydrated.outputPackageLifecycleResume
      ? { outputPackageLifecycleResume: hydrated.outputPackageLifecycleResume }
      : {})
  };
}

function isMissingOutputPackageLifecycleOrchestrationRecordError(error: unknown): boolean {
  return error instanceof Error
    && /^Missing output-package lifecycle orchestration record for key /u.test(error.message);
}

function cloneUnknown<T>(value: T): T {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}
