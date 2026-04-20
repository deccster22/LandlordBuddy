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
  Br02ConsumerAssessment
} from "../br02/index.js";
import {
  deriveBr02DownstreamAssessment,
  type Br02DownstreamAssessment
} from "../br02/downstream.js";
import {
  deriveBr01DownstreamPosture,
  type Br01RoutingResult
} from "../br01/index.js";
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
  deriveTouchpointConsequenceSurfaceKeys,
  resolveTouchpointControl,
  type TouchpointControlOutputs,
  type TouchpointMetadata,
  type TouchpointPostureOverride
} from "../touchpoints/index.js";

export interface OfficialHandoffGuidanceInput {
  matterId: EntityId;
  forumPath: ForumPathState;
  officialHandoff: OfficialHandoffStateRecord;
  carryForwardControls?: CarryForwardControl[];
  br01RoutingResult?: Br01RoutingResult;
  touchpointIds?: readonly string[];
  touchpointPostureOverrides?: readonly TouchpointPostureOverride[];
  readinessOutcome?: NoticeReadinessOutcome;
  noticeReadiness?: NoticeReadinessResult;
  br02ConsumerAssessment?: Br02ConsumerAssessment;
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
  const touchpointResolution = resolveTouchpointControl({
    forumPath: input.forumPath.path,
    ...(input.touchpointIds ? { touchpointIds: input.touchpointIds } : {}),
    ...(input.touchpointPostureOverrides
      ? { postureOverrides: input.touchpointPostureOverrides }
      : {})
  });
  const touchpoints = touchpointResolution.touchpoints;
  const br02DownstreamAssessment = resolveBr02DownstreamAssessment(input);
  const br01DownstreamPosture = input.br01RoutingResult
    ? deriveBr01DownstreamPosture(input.br01RoutingResult)
    : undefined;
  const carryForwardControls = mergeCarryForwardControls(
    input.carryForwardControls ?? [],
    ...(input.timelineContent ? [input.timelineContent.carryForwardControls] : []),
    touchpointResolution.carryForwardControls,
    ...(br01DownstreamPosture ? [br01DownstreamPosture.carryForwardControls] : []),
    ...(br02DownstreamAssessment ? [br02DownstreamAssessment.carryForwardControls] : [])
  );
  const boundaryCodes = [...officialHandoffBoundaryCodes];
  const guidanceBlockKeys = buildGuidanceBlockKeys(
    touchpointResolution.controlOutputs,
    carryForwardControls,
    input.timelineContent
  );
  const readinessOutcome = input.noticeReadiness?.outcome ?? input.readinessOutcome;
  const downstreamReadinessOutcome = resolveDownstreamReadinessOutcome([
    readinessOutcome,
    br01DownstreamPosture?.readinessOutcome,
    br02DownstreamAssessment?.readinessOutcome
  ]);
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
  const br02ConsumerAssessment = input.br02ConsumerAssessment;

  // Preserve the existing notice-readiness or explicit readiness outcome when present; only use the nested BR02 consumer bundle for downstream BR02 bridging.
  if (input.noticeReadiness || input.readinessOutcome || !br02ConsumerAssessment) {
    return undefined;
  }

  return deriveBr02DownstreamAssessment({
    consumerAssessment: br02ConsumerAssessment
  });
}

function buildGuidanceBlockKeys(
  touchpointControlOutputs: TouchpointControlOutputs,
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

  blockKeys.push(...deriveTouchpointConsequenceSurfaceKeys(touchpointControlOutputs));

  if (carryForwardControls.some((control) => control.severity === "SLOWDOWN")) {
    blockKeys.push("slowdown-review");
  }

  if (carryForwardControls.some((control) => control.severity === "REFERRAL")) {
    blockKeys.push("referral-stop");
  }

  return blockKeys;
}

function resolveDownstreamReadinessOutcome(
  outcomes: Array<NoticeReadinessOutcome | undefined>
): NoticeReadinessOutcome | undefined {
  const definedOutcomes = outcomes.filter((outcome): outcome is NoticeReadinessOutcome => (
    outcome !== undefined
  ));

  if (definedOutcomes.length === 0) {
    return undefined;
  }

  const rankedOutcomes = [...definedOutcomes].sort((left, right) => (
    readinessOutcomePriority[right] - readinessOutcomePriority[left]
  ));

  return rankedOutcomes[0];
}

const readinessOutcomePriority: Record<NoticeReadinessOutcome, number> = {
  READY_FOR_REVIEW: 0,
  REVIEW_REQUIRED: 1,
  REFER_OUT: 2,
  BLOCKED: 3
};

export * from "./reviewState.js";
