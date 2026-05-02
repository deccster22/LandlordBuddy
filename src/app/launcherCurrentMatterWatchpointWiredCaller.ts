import {
  consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint,
  type LauncherCurrentMatterInternalHandlingAction
} from "./launcherCurrentMatterHandlingActionConsumer.js";
import {
  emitLauncherCurrentMatterWatchpointEvents,
  type LauncherCurrentMatterWatchpointEvent,
  type LauncherCurrentMatterWatchpointEventSink,
  type LauncherCurrentMatterWatchpointSourceSeam
} from "./launcherCurrentMatterWatchpointLoggingEmitter.js";
import type {
  HydrateOutputCheckpointInput
} from "./outputHandoffCheckpointHydration.js";
import type {
  LauncherCurrentMatterNonLifecycleTransitionInput
} from "./launcherCurrentMatterTransitionOrchestrationEntry.js";

export interface ConsumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsInput {
  outputCheckpoint: HydrateOutputCheckpointInput;
  nonLifecycleTransitionInput?: LauncherCurrentMatterNonLifecycleTransitionInput;
  watchpointSink?: LauncherCurrentMatterWatchpointEventSink;
  watchpointObservedAt?: string;
  watchpointSourceSeam?: LauncherCurrentMatterWatchpointSourceSeam;
  watchpointSourceTaskLineage?: readonly string[];
}

export interface ConsumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsResult {
  handlingAction: LauncherCurrentMatterInternalHandlingAction;
  emittedWatchpointEvents: LauncherCurrentMatterWatchpointEvent[];
}

export function consumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsFromOutputCheckpoint(
  input: ConsumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsInput
): ConsumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsResult {
  const handlingAction =
    consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
      outputCheckpoint: input.outputCheckpoint,
      ...(input.nonLifecycleTransitionInput
        ? { nonLifecycleTransitionInput: input.nonLifecycleTransitionInput }
        : {})
    });

  if (!input.watchpointSink) {
    return {
      handlingAction,
      emittedWatchpointEvents: []
    };
  }

  const locator = input.outputCheckpoint.outputPackageLifecycleResumeCheckpoint?.locator;
  const emittedWatchpointEvents = emitLauncherCurrentMatterWatchpointEvents({
    sink: input.watchpointSink,
    handlingAction,
    ...(input.watchpointObservedAt
      ? { observedAt: input.watchpointObservedAt }
      : {}),
    ...(input.watchpointSourceSeam
      ? { sourceSeam: input.watchpointSourceSeam }
      : {}),
    ...(input.watchpointSourceTaskLineage
      ? { sourceTaskLineage: input.watchpointSourceTaskLineage }
      : {}),
    matterLocatorRef: `matter:${input.outputCheckpoint.matterId}`,
    ...(locator
      ? {
        outputPackageLocatorRef: `outputPackage:${locator.outputPackageId}`,
        auditProvenanceRef: `lifecycleRequest:${locator.lifecycleRequestId}`
      }
      : {})
  });

  return {
    handlingAction,
    emittedWatchpointEvents
  };
}
