import type { EntityId } from "../../domain/model.js";
import type {
  ForumPathState,
  OfficialHandoffStateRecord,
  OutputModeState
} from "../../domain/preparation.js";
import {
  mergeCarryForwardControls,
  type CarryForwardControl
} from "../../domain/posture.js";
import {
  buildOfficialHandoffGuidanceShell,
  type OfficialHandoffGuidanceShell
} from "../handoff/index.js";
import type { NoticeReadinessResult } from "../notice-readiness/index.js";
import type { TimelineShell } from "../timeline/index.js";
import {
  deriveOutputPackageReadinessContent,
  type OutputPackageReadinessContent
} from "./readinessAdapter.js";
import {
  deriveOutputPackageTimelineContent,
  type OutputPackageTimelineContent
} from "./timelineAdapter.js";
import {
  deriveRendererState,
  type RendererState
} from "./rendererStateAdapter.js";
import {
  buildStructuralTrustBinding,
  type StructuralTrustBinding
} from "./trustBindings.js";
import {
  listTouchpointsForForumPath,
  lookupTouchpointMetadata,
  type TouchpointMetadata
} from "../touchpoints/index.js";

export interface OutputSelectionInput {
  matterId: EntityId;
  forumPath: ForumPathState;
  outputMode: OutputModeState;
  officialHandoff: OfficialHandoffStateRecord;
  carryForwardControls?: CarryForwardControl[];
  touchpointIds?: string[];
  noticeReadiness?: NoticeReadinessResult;
  timeline?: TimelineShell;
}

export interface OutputSelection {
  matterId: EntityId;
  forumPath: ForumPathState;
  outputMode: OutputModeState;
  officialHandoff: OfficialHandoffStateRecord;
  touchpoints: TouchpointMetadata[];
  carryForwardControls: CarryForwardControl[];
  readinessContent?: OutputPackageReadinessContent;
  timelineContent?: OutputPackageTimelineContent;
}

interface OutputPackageBase {
  matterId: EntityId;
  forumPath: ForumPathState;
  outputMode: OutputModeState;
  officialHandoff: OfficialHandoffStateRecord;
  touchpoints: TouchpointMetadata[];
  carryForwardControls: CarryForwardControl[];
  trustBinding: StructuralTrustBinding;
  rendererState: RendererState;
  officialSystemAction: "NOT_INCLUDED";
  timelineContent?: OutputPackageTimelineContent;
}

export interface PrintableOutputPackageShell extends OutputPackageBase {
  kind: "PRINTABLE_OUTPUT";
  sectionKeys: string[];
}

export interface PrepPackOutputPackageShell extends OutputPackageBase {
  kind: "PREP_PACK_COPY_READY";
  blockKeys: string[];
}

export interface OfficialHandoffGuidancePackageShell extends OutputPackageBase {
  kind: "OFFICIAL_HANDOFF_GUIDANCE";
  guidance: OfficialHandoffGuidanceShell;
}

export type OutputPackageShell =
  | PrintableOutputPackageShell
  | PrepPackOutputPackageShell
  | OfficialHandoffGuidancePackageShell;

export function selectOutputShell(input: OutputSelectionInput): OutputSelection {
  const touchpoints = resolveTouchpoints(input.forumPath.path, input.touchpointIds);
  const readinessContent = input.noticeReadiness
    ? deriveOutputPackageReadinessContent(input.noticeReadiness)
    : undefined;
  const timelineContent = input.timeline
    ? deriveOutputPackageTimelineContent(input.timeline)
    : undefined;
  const carryForwardControls = mergeCarryForwardControls(
    input.carryForwardControls ?? [],
    ...(readinessContent ? [readinessContent.carryForwardControls] : []),
    ...(timelineContent ? [timelineContent.carryForwardControls] : []),
    ...touchpoints.map((touchpoint) => touchpoint.carryForwardControls)
  );

  return {
    matterId: input.matterId,
    forumPath: input.forumPath,
    outputMode: input.outputMode,
    officialHandoff: input.officialHandoff,
    touchpoints,
    carryForwardControls,
    ...(readinessContent ? { readinessContent } : {}),
    ...(timelineContent ? { timelineContent } : {})
  };
}

export function generateOutputPackageShell(
  input: OutputSelectionInput
): OutputPackageShell {
  const selection = selectOutputShell(input);
  const base = {
    matterId: selection.matterId,
    forumPath: selection.forumPath,
    outputMode: selection.outputMode,
    officialHandoff: selection.officialHandoff,
    touchpoints: selection.touchpoints,
    carryForwardControls: selection.carryForwardControls,
    officialSystemAction: "NOT_INCLUDED" as const,
    ...(selection.timelineContent ? { timelineContent: selection.timelineContent } : {})
  };

  switch (selection.outputMode.mode) {
    case "PRINTABLE_OUTPUT": {
      const sectionKeys = buildPrintableSectionKeys(
        selection.readinessContent,
        selection.timelineContent
      );
      const trustBinding = buildStructuralTrustBinding({
        kind: "PRINTABLE_OUTPUT",
        officialHandoff: selection.officialHandoff,
        ...(input.noticeReadiness
          ? { readinessOutcome: input.noticeReadiness.outcome }
          : {}),
        sectionKeys,
        touchpoints: selection.touchpoints,
        carryForwardControls: selection.carryForwardControls
      });
      const rendererState = deriveRendererState({
        ...(input.noticeReadiness ? { noticeReadiness: input.noticeReadiness } : {}),
        ...(selection.timelineContent ? { timelineContent: selection.timelineContent } : {}),
        reviewHandoffState: trustBinding.reviewHandoffState,
        trustBinding
      });

      return {
        ...base,
        kind: "PRINTABLE_OUTPUT",
        sectionKeys,
        trustBinding,
        rendererState
      };
    }
    case "PREP_PACK_COPY_READY": {
      const blockKeys = buildPrepPackBlockKeys(
        selection.readinessContent,
        selection.timelineContent
      );
      const trustBinding = buildStructuralTrustBinding({
        kind: "PREP_PACK_COPY_READY",
        officialHandoff: selection.officialHandoff,
        ...(input.noticeReadiness
          ? { readinessOutcome: input.noticeReadiness.outcome }
          : {}),
        blockKeys,
        touchpoints: selection.touchpoints,
        carryForwardControls: selection.carryForwardControls
      });
      const rendererState = deriveRendererState({
        ...(input.noticeReadiness ? { noticeReadiness: input.noticeReadiness } : {}),
        ...(selection.timelineContent ? { timelineContent: selection.timelineContent } : {}),
        reviewHandoffState: trustBinding.reviewHandoffState,
        trustBinding
      });

      return {
        ...base,
        kind: "PREP_PACK_COPY_READY",
        blockKeys,
        trustBinding,
        rendererState
      };
    }
    case "OFFICIAL_HANDOFF_GUIDANCE": {
      const guidance = buildOfficialHandoffGuidanceShell({
        matterId: selection.matterId,
        forumPath: selection.forumPath,
        officialHandoff: selection.officialHandoff,
        carryForwardControls: selection.carryForwardControls,
        touchpointIds: selection.touchpoints.map((touchpoint) => touchpoint.id),
        ...(selection.timelineContent
          ? { timelineContent: selection.timelineContent }
          : {}),
        ...(input.noticeReadiness
          ? { noticeReadiness: input.noticeReadiness }
          : {}),
        ...(input.noticeReadiness
          ? { readinessOutcome: input.noticeReadiness.outcome }
          : {})
      });

      return {
        ...base,
        kind: "OFFICIAL_HANDOFF_GUIDANCE",
        guidance,
        trustBinding: guidance.trustBinding,
        rendererState: guidance.rendererState
      };
    }
  }
}

function resolveTouchpoints(
  forumPath: ForumPathState["path"],
  touchpointIds?: string[]
): TouchpointMetadata[] {
  if (!touchpointIds || touchpointIds.length === 0) {
    return listTouchpointsForForumPath(forumPath);
  }

  return touchpointIds.flatMap((touchpointId) => {
    const touchpoint = lookupTouchpointMetadata(touchpointId);
    return touchpoint ? [touchpoint] : [];
  });
}

function buildPrintableSectionKeys(
  readinessContent?: OutputPackageReadinessContent,
  timelineContent?: OutputPackageTimelineContent
): string[] {
  if (!readinessContent && !timelineContent) {
    return [
      "matter-summary",
      "arrears-snapshot",
      "source-index",
      "review-hold-points"
    ];
  }

  const sectionKeys = ["matter-summary", "arrears-snapshot"];

  if (readinessContent?.showReadinessSummary) {
    sectionKeys.push("readiness-summary");
  }

  if (timelineContent?.showSequencingSummary) {
    sectionKeys.push("sequencing-summary");
  }

  sectionKeys.push("source-index");

  if (readinessContent?.showBlockerSummary) {
    sectionKeys.push("blocker-summary");
  }

  if (timelineContent?.showBlockedSequencingSummary) {
    sectionKeys.push("sequencing-blocked");
  }

  if (readinessContent?.showReviewHoldPoints) {
    sectionKeys.push("review-hold-points");
  }

  if (timelineContent?.showDependencyHoldPoints) {
    sectionKeys.push("dependency-hold-points");
  }

  if (readinessContent?.showGuardedIssueSection) {
    sectionKeys.push("guarded-review-flags");
  }

  if (timelineContent?.showGuardedSequencingSummary) {
    sectionKeys.push("sequencing-guarded");
  }

  if (timelineContent?.showExternalStepSummary) {
    sectionKeys.push("external-step-summary");
  }

  if (readinessContent?.showReferralStop) {
    sectionKeys.push("referral-stop");
  }

  return sectionKeys;
}

function buildPrepPackBlockKeys(
  readinessContent?: OutputPackageReadinessContent,
  timelineContent?: OutputPackageTimelineContent
): string[] {
  if (!readinessContent && !timelineContent) {
    return [
      "copy-ready-facts",
      "supporting-evidence-index",
      "guarded-review-flags"
    ];
  }

  const blockKeys: string[] = [];

  if (readinessContent?.showReadinessSummary) {
    blockKeys.push("readiness-summary");
  }

  if (timelineContent?.showSequencingSummary) {
    blockKeys.push("sequencing-summary");
  }

  if (readinessContent?.showBlockerSummary) {
    blockKeys.push("blocker-summary");
  }

  if (timelineContent?.showBlockedSequencingSummary) {
    blockKeys.push("sequencing-blocked");
  }

  if (readinessContent?.showReviewHoldPoints) {
    blockKeys.push("review-hold-points");
  }

  if (timelineContent?.showDependencyHoldPoints) {
    blockKeys.push("dependency-hold-points");
  }

  if (readinessContent?.showGuardedIssueSection) {
    blockKeys.push("guarded-review-flags");
  }

  if (timelineContent?.showGuardedSequencingSummary) {
    blockKeys.push("sequencing-guarded");
  }

  if (timelineContent?.showExternalStepSummary) {
    blockKeys.push("external-step-summary");
  }

  if (readinessContent?.showReferralStop) {
    blockKeys.push("referral-stop");
  }

  if (shouldIncludeCopyReadyFacts(readinessContent, timelineContent)) {
    blockKeys.push("copy-ready-facts");
  }

  blockKeys.push("supporting-evidence-index");

  return blockKeys;
}

function shouldIncludeCopyReadyFacts(
  readinessContent?: OutputPackageReadinessContent,
  timelineContent?: OutputPackageTimelineContent
): boolean {
  if (readinessContent) {
    return readinessContent.allowCopyReadyFacts
      && (timelineContent?.allowCopyReadyFactsWhenTimelineReady ?? true);
  }

  return timelineContent?.allowCopyReadyFactsWhenTimelineReady ?? true;
}

export * from "./trustBindings.js";
export * from "./timelineAdapter.js";
export * from "./rendererStateAdapter.js";
