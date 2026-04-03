import type { CarryForwardControl, VisibleSourceType } from "../../domain/posture.js";
import type { TimelineMilestone, TimelineShell } from "../timeline/index.js";

export interface OutputPackageTimelineContent {
  carryForwardControls: CarryForwardControl[];
  showSequencingSummary: boolean;
  showBlockedSequencingSummary: boolean;
  showGuardedSequencingSummary: boolean;
  showExternalStepSummary: boolean;
  showDependencyHoldPoints: boolean;
  allowCopyReadyFactsWhenTimelineReady: boolean;
  reviewCueKeys: string[];
}

export function deriveOutputPackageTimelineContent(
  timeline: TimelineShell
): OutputPackageTimelineContent {
  const hasBlockedMilestone = timeline.milestones.some(
    (milestone) => milestone.status === "BLOCKED"
  );
  const hasGuardedMilestone = timeline.milestones.some((milestone) => (
    milestone.status === "GUARDED"
    || (
      milestone.status !== "BLOCKED"
      && milestone.dependsOn.some((dependency) => dependency.status === "GUARDED")
    )
  ));
  const hasExternalMilestone = timeline.milestones.some((milestone) => (
    milestone.status === "EXTERNAL"
    || (
      milestone.status !== "BLOCKED"
      && milestone.dependsOn.some((dependency) => dependency.status === "EXTERNAL")
    )
  ));
  const hasDependencyHoldPoints = timeline.milestones.some((milestone) => (
    milestone.dependsOn.some((dependency) => dependency.status !== "SATISFIED")
  ));

  return {
    carryForwardControls: timeline.milestones.flatMap((milestone) => {
      const carryForwardControl = toTimelineCarryForwardControl(milestone);
      return carryForwardControl ? [carryForwardControl] : [];
    }),
    showSequencingSummary: timeline.milestones.length > 0,
    showBlockedSequencingSummary: hasBlockedMilestone,
    showGuardedSequencingSummary: hasGuardedMilestone,
    showExternalStepSummary: hasExternalMilestone,
    showDependencyHoldPoints: hasDependencyHoldPoints,
    allowCopyReadyFactsWhenTimelineReady: timeline.thresholdState.kind === "THRESHOLD_MET",
    reviewCueKeys: buildTimelineReviewCueKeys({
      timeline,
      hasBlockedMilestone,
      hasGuardedMilestone,
      hasExternalMilestone,
      hasDependencyHoldPoints
    })
  };
}

function toTimelineCarryForwardControl(
  milestone: TimelineMilestone
): CarryForwardControl | undefined {
  if (milestone.status === "GUARDED") {
    return {
      code: `${milestone.category}_TIMELINE_GUARDED`,
      severity: "SLOWDOWN",
      summary: milestone.visibilityReason,
      visibleSourceType: mapTimelineVisibleSourceType(milestone),
      deterministic: false,
      ...(milestone.guardedInsertionPoint
        ? { guardedInsertionPoint: milestone.guardedInsertionPoint }
        : {})
    };
  }

  if (milestone.status === "EXTERNAL") {
    return {
      code: `${milestone.category}_TIMELINE_EXTERNAL`,
      severity: "SLOWDOWN",
      summary: milestone.visibilityReason,
      visibleSourceType: mapTimelineVisibleSourceType(milestone),
      deterministic: false,
      ...(milestone.guardedInsertionPoint
        ? { guardedInsertionPoint: milestone.guardedInsertionPoint }
        : {})
    };
  }

  return undefined;
}

function buildTimelineReviewCueKeys(input: {
  timeline: TimelineShell;
  hasBlockedMilestone: boolean;
  hasGuardedMilestone: boolean;
  hasExternalMilestone: boolean;
  hasDependencyHoldPoints: boolean;
}): string[] {
  const reviewCueKeys: string[] = [];

  if (input.hasBlockedMilestone) {
    reviewCueKeys.push(
      input.timeline.thresholdState.kind === "BLOCKED_INVALID"
        ? "timeline-review.blocked-invalid"
        : "timeline-review.blocked"
    );
  }

  if (input.hasGuardedMilestone) {
    reviewCueKeys.push("timeline-review.guarded");
  }

  if (input.hasExternalMilestone) {
    reviewCueKeys.push("timeline-review.external-handoff");
  }

  if (input.hasDependencyHoldPoints) {
    reviewCueKeys.push("timeline-review.dependency-hold-points");
  }

  return reviewCueKeys;
}

function mapTimelineVisibleSourceType(
  milestone: TimelineMilestone
): VisibleSourceType {
  switch (milestone.sourceSensitivity) {
    case "STABLE_RULE":
      return "STABLE_RULE";
    case "GUARDED_DOCTRINE":
      return "UNRESOLVED_ITEM";
    case "EXTERNAL_OFFICIAL_INSTRUCTION":
      return "OFFICIAL_GUIDANCE";
  }
}

