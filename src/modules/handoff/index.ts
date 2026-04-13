import type { EntityId } from "../../domain/model.js";
import type {
  ForumPathState,
  OfficialHandoffStateRecord
} from "../../domain/preparation.js";
import {
  mergeCarryForwardControls,
  type CarryForwardControl
} from "../../domain/posture.js";
import type {
  Br02ConsumerAssessment,
  Br02ServiceEventAssessment
} from "../br02/index.js";
import {
  deriveBr02DownstreamAssessment,
  type Br02DownstreamAssessment
} from "../br02/downstream.js";
import {
  deriveRendererState,
  type RendererState
} from "../output/rendererStateAdapter.js";
import type { OutputPackageTimelineContent } from "../output/timelineAdapter.js";
import {
  buildStructuralTrustBinding,
  type StructuralTrustBinding
} from "../output/trustBindings.js";
import type {
  NoticeReadinessOutcome,
  NoticeReadinessResult
} from "../notice-readiness/index.js";
import {
  listTouchpointsForForumPath,
  lookupTouchpointMetadata,
  type TouchpointMetadata
} from "../touchpoints/index.js";

export interface OfficialHandoffGuidanceInput {
  matterId: EntityId;
  forumPath: ForumPathState;
  officialHandoff: OfficialHandoffStateRecord;
  carryForwardControls?: CarryForwardControl[];
  touchpointIds?: string[];
  readinessOutcome?: NoticeReadinessOutcome;
  noticeReadiness?: NoticeReadinessResult;
  br02ConsumerAssessment?: Br02ConsumerAssessment;
  br02Assessment?: Br02ServiceEventAssessment;
  timelineContent?: OutputPackageTimelineContent;
}

export interface OfficialHandoffGuidanceShell {
  kind: "OFFICIAL_HANDOFF_GUIDANCE";
  matterId: EntityId;
  forumPath: ForumPathState;
  officialHandoff: OfficialHandoffStateRecord;
  boundaryCodes: string[];
  guidanceBlockKeys: string[];
  touchpoints: TouchpointMetadata[];
  carryForwardControls: CarryForwardControl[];
  trustBinding: StructuralTrustBinding;
  rendererState: RendererState;
  timelineContent?: OutputPackageTimelineContent;
}

export const officialHandoffBoundaryCodes = Object.freeze([
  "PREP_AND_HANDOFF_ONLY",
  "NO_PRODUCT_SUBMISSION",
  "NO_PORTAL_MIMICRY"
]);

export function buildOfficialHandoffGuidanceShell(
  input: OfficialHandoffGuidanceInput
): OfficialHandoffGuidanceShell {
  const touchpoints = resolveTouchpoints(input.forumPath.path, input.touchpointIds);
  const br02DownstreamAssessment = resolveBr02DownstreamAssessment(input);
  const carryForwardControls = mergeCarryForwardControls(
    input.carryForwardControls ?? [],
    ...(input.timelineContent ? [input.timelineContent.carryForwardControls] : []),
    ...touchpoints.map((touchpoint) => touchpoint.carryForwardControls),
    ...(br02DownstreamAssessment ? [br02DownstreamAssessment.carryForwardControls] : [])
  );
  const boundaryCodes = [...officialHandoffBoundaryCodes];
  const guidanceBlockKeys = buildGuidanceBlockKeys(
    touchpoints,
    carryForwardControls,
    input.timelineContent
  );
  const readinessOutcome = input.noticeReadiness?.outcome ?? input.readinessOutcome;
  const downstreamReadinessOutcome = readinessOutcome
    ?? br02DownstreamAssessment?.readinessOutcome;
  const trustBinding = buildStructuralTrustBinding({
    kind: "OFFICIAL_HANDOFF_GUIDANCE",
    officialHandoff: input.officialHandoff,
    ...(downstreamReadinessOutcome
      ? { readinessOutcome: downstreamReadinessOutcome }
      : {}),
    blockKeys: guidanceBlockKeys,
    touchpoints,
    carryForwardControls,
    boundaryCodes
  });
  const rendererState = deriveRendererState({
    ...(input.noticeReadiness ? { noticeReadiness: input.noticeReadiness } : {}),
    ...(input.timelineContent ? { timelineContent: input.timelineContent } : {}),
    reviewHandoffState: trustBinding.reviewHandoffState,
    trustBinding
  });

  return {
    kind: "OFFICIAL_HANDOFF_GUIDANCE",
    matterId: input.matterId,
    forumPath: input.forumPath,
    officialHandoff: input.officialHandoff,
    boundaryCodes,
    guidanceBlockKeys,
    touchpoints,
    carryForwardControls,
    ...(input.timelineContent ? { timelineContent: input.timelineContent } : {}),
    trustBinding,
    rendererState
  };
}

function resolveBr02DownstreamAssessment(
  input: OfficialHandoffGuidanceInput
): Br02DownstreamAssessment | undefined {
  const br02ConsumerAssessment = input.br02ConsumerAssessment
    ?? input.br02Assessment?.consumerAssessment;
  const legacyReadyForDeterministicDateHandling =
    input.br02Assessment?.readyForDeterministicDateHandling;

  // Preserve the existing notice-readiness or explicit readiness outcome when present; prefer the nested BR02 consumer bundle and only fall back to the legacy shell for compatibility.
  if (input.noticeReadiness || input.readinessOutcome || !br02ConsumerAssessment) {
    return undefined;
  }

  return deriveBr02DownstreamAssessment({
    consumerAssessment: br02ConsumerAssessment,
    ...(typeof legacyReadyForDeterministicDateHandling === "boolean"
      ? {
          legacyReadyForDeterministicDateHandling:
            legacyReadyForDeterministicDateHandling
        }
      : {})
  });
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

function buildGuidanceBlockKeys(
  touchpoints: TouchpointMetadata[],
  carryForwardControls: CarryForwardControl[],
  timelineContent?: OutputPackageTimelineContent
): string[] {
  const blockKeys = [
    "handoff-boundary",
    "external-action-owner",
    "review-before-official-step"
  ];

  if (timelineContent?.showSequencingSummary) {
    blockKeys.push("sequencing-summary");
  }

  if (timelineContent?.showBlockedSequencingSummary) {
    blockKeys.push("sequencing-blocked");
  }

  if (timelineContent?.showDependencyHoldPoints) {
    blockKeys.push("dependency-hold-points");
  }

  if (timelineContent?.showGuardedSequencingSummary) {
    blockKeys.push("sequencing-guarded");
  }

  if (timelineContent?.showExternalStepSummary) {
    blockKeys.push("external-step-summary");
  }

  if (
    touchpoints.some(
      (touchpoint) => touchpoint.classification === "HANDOFF_ONLY_AUTHENTICATED"
    )
  ) {
    blockKeys.push("authenticated-surface-handoff");
  }

  if (
    touchpoints.some(
      (touchpoint) => touchpoint.classification === "FRESHNESS_SENSITIVE"
    )
  ) {
    blockKeys.push("freshness-check");
  }

  if (carryForwardControls.some((control) => control.severity === "SLOWDOWN")) {
    blockKeys.push("slowdown-review");
  }

  if (carryForwardControls.some((control) => control.severity === "REFERRAL")) {
    blockKeys.push("referral-stop");
  }

  return blockKeys;
}

export * from "./reviewState.js";
