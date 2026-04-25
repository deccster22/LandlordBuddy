import {
  buildOfficialHandoffGuidanceShell,
  type OfficialHandoffGuidanceInput,
  type OfficialHandoffGuidanceShell
} from "../modules/handoff/index.js";
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

export interface HydrateOutputCheckpointInput
  extends Omit<OutputSelectionInput, "touchpointPostureSnapshots"> {
  out04TouchpointSourceEvents?: readonly Br03TouchpointPostureSourceEvent[];
}

export interface HydrateOfficialHandoffCheckpointInput
  extends Omit<OfficialHandoffGuidanceInput, "touchpointPostureSnapshots"> {
  out04TouchpointSourceEvents?: readonly Br03TouchpointPostureSourceEvent[];
}

export interface HydratedOutputCheckpointResult {
  outputSelectionInput: OutputSelectionInput;
  touchpointSnapshotProduction: Br03TouchpointSnapshotProductionResult;
}

export interface HydratedOfficialHandoffCheckpointResult {
  officialHandoffInput: OfficialHandoffGuidanceInput;
  touchpointSnapshotProduction: Br03TouchpointSnapshotProductionResult;
}

export interface HydratedOutputCompositionResult {
  outputPackage: OutputPackageShell;
  touchpointSnapshotProduction: Br03TouchpointSnapshotProductionResult;
}

export interface HydratedOfficialHandoffCompositionResult {
  guidance: OfficialHandoffGuidanceShell;
  touchpointSnapshotProduction: Br03TouchpointSnapshotProductionResult;
}

export function hydrateOutputCheckpointForComposition(
  input: HydrateOutputCheckpointInput
): HydratedOutputCheckpointResult {
  const {
    out04TouchpointSourceEvents,
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

  return {
    outputSelectionInput: {
      ...outputSelectionInputWithoutSnapshots,
      touchpointPostureSnapshots: touchpointSnapshotProduction.snapshots
    },
    touchpointSnapshotProduction
  };
}

export function hydrateOfficialHandoffCheckpointForComposition(
  input: HydrateOfficialHandoffCheckpointInput
): HydratedOfficialHandoffCheckpointResult {
  const {
    out04TouchpointSourceEvents,
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

  return {
    officialHandoffInput: {
      ...officialHandoffInputWithoutSnapshots,
      touchpointPostureSnapshots: touchpointSnapshotProduction.snapshots
    },
    touchpointSnapshotProduction
  };
}

export function composeOutputPackageFromHydratedCheckpoint(
  input: HydrateOutputCheckpointInput
): HydratedOutputCompositionResult {
  const hydrated = hydrateOutputCheckpointForComposition(input);

  return {
    outputPackage: generateOutputPackageShell(hydrated.outputSelectionInput),
    touchpointSnapshotProduction: hydrated.touchpointSnapshotProduction
  };
}

export function composeOfficialHandoffGuidanceFromHydratedCheckpoint(
  input: HydrateOfficialHandoffCheckpointInput
): HydratedOfficialHandoffCompositionResult {
  const hydrated = hydrateOfficialHandoffCheckpointForComposition(input);

  return {
    guidance: buildOfficialHandoffGuidanceShell(hydrated.officialHandoffInput),
    touchpointSnapshotProduction: hydrated.touchpointSnapshotProduction
  };
}
