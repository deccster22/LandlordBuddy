import type {
  DateTimeString,
  EntityId,
  ReferralFlag,
  RoutingDecision,
  OutputPackage,
  PrivacyLifecycleHooks
} from "../../domain/model.js";
import type {
  ForumPathState,
  OfficialHandoffStateRecord,
  OutputModeState
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
  resolveBr01DownstreamPosture,
  type Br01RoutingResult
} from "../br01/index.js";
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
  deriveTouchpointConsequenceSurfaceKeys,
  resolveTouchpointControl,
  type TouchpointControlOutputs,
  type TouchpointMetadata,
  type TouchpointPostureSnapshot
} from "../touchpoints/index.js";
import {
  buildBr04PrivacyHooksFromSource,
  type Br04PolicySource
} from "../br04/index.js";

export interface OutputSelectionInput {
  matterId: EntityId;
  forumPath: ForumPathState;
  outputMode: OutputModeState;
  officialHandoff: OfficialHandoffStateRecord;
  carryForwardControls?: CarryForwardControl[];
  br01RoutingDecision?: RoutingDecision;
  br01ReferralFlags?: readonly ReferralFlag[];
  br01RoutingResult?: Br01RoutingResult;
  touchpointIds?: readonly string[];
  touchpointPostureSnapshots?: readonly TouchpointPostureSnapshot[];
  noticeReadiness?: NoticeReadinessResult;
  br02ConsumerAssessment?: Br02ConsumerAssessment;
  timeline?: TimelineShell;
}

export interface OutputSelection {
  matterId: EntityId;
  forumPath: ForumPathState;
  outputMode: OutputModeState;
  officialHandoff: OfficialHandoffStateRecord;
  touchpoints: TouchpointMetadata[];
  touchpointControlOutputs: TouchpointControlOutputs;
  carryForwardControls: CarryForwardControl[];
  readinessContent?: OutputPackageReadinessContent;
  readinessOutcome?: NoticeReadinessResult["outcome"];
  timelineContent?: OutputPackageTimelineContent;
}

interface OutputPackageBase {
  matterId: EntityId;
  forumPath: ForumPathState;
  outputMode: OutputModeState;
  officialHandoff: OfficialHandoffStateRecord;
  touchpoints: TouchpointMetadata[];
  touchpointControlOutputs: TouchpointControlOutputs;
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

export interface OutputPackagePrivacyHookSourceInput {
  source?: Br04PolicySource | undefined;
  policyKeys?: readonly string[] | undefined;
  accessScopeIds?: readonly EntityId[] | undefined;
  hookOverrides?: Partial<PrivacyLifecycleHooks> | undefined;
}

export interface CreateOutputPackageRecordInput extends OutputSelectionInput {
  id: EntityId;
  noticeDraftId?: EntityId;
  evidenceItemIds?: EntityId[];
  generatedAt?: DateTimeString;
  completeness?: OutputPackage["completeness"];
}

export function selectOutputShell(input: OutputSelectionInput): OutputSelection {
  const touchpointResolution = resolveTouchpointControl({
    forumPath: input.forumPath.path,
    ...(input.touchpointIds ? { touchpointIds: input.touchpointIds } : {}),
    ...(input.touchpointPostureSnapshots
      ? { postureSnapshots: input.touchpointPostureSnapshots }
      : {})
  });
  const touchpoints = touchpointResolution.touchpoints;
  const br02DownstreamAssessment = resolveBr02DownstreamAssessment(input);
  const br01DownstreamPosture = resolveBr01DownstreamPosture({
    ...(input.br01RoutingDecision
      ? { routingDecision: input.br01RoutingDecision }
      : {}),
    ...(input.br01ReferralFlags
      ? { referralFlags: input.br01ReferralFlags }
      : {}),
    ...(input.br01RoutingResult
      ? { routingResult: input.br01RoutingResult }
      : {})
  });
  const baseReadinessContent = input.noticeReadiness
    ? deriveOutputPackageReadinessContent(input.noticeReadiness)
    : br02DownstreamAssessment?.readinessContent;
  const timelineContent = input.timeline
    ? deriveOutputPackageTimelineContent(input.timeline)
    : undefined;
  const carryForwardControls = mergeCarryForwardControls(
    input.carryForwardControls ?? [],
    ...(baseReadinessContent ? [baseReadinessContent.carryForwardControls] : []),
    ...(br01DownstreamPosture ? [br01DownstreamPosture.carryForwardControls] : []),
    ...(timelineContent ? [timelineContent.carryForwardControls] : []),
    touchpointResolution.carryForwardControls
  );
  const readinessOutcome = resolveDownstreamReadinessOutcome([
    input.noticeReadiness?.outcome,
    br01DownstreamPosture?.readinessOutcome,
    br02DownstreamAssessment?.readinessOutcome
  ]);
  const readinessContent = deriveDownstreamReadinessContent({
    baseReadinessContent,
    readinessOutcome,
    carryForwardControls
  });

  return {
    matterId: input.matterId,
    forumPath: input.forumPath,
    outputMode: input.outputMode,
    officialHandoff: input.officialHandoff,
    touchpoints,
    touchpointControlOutputs: touchpointResolution.controlOutputs,
    carryForwardControls,
    ...(readinessContent ? { readinessContent } : {}),
    ...(readinessOutcome ? { readinessOutcome } : {}),
    ...(timelineContent ? { timelineContent } : {})
  };
}

export function generateOutputPackageShell(
  input: OutputSelectionInput
): OutputPackageShell {
  const selection = selectOutputShell(input);
  const br02ConsumerAssessment = input.br02ConsumerAssessment;
  const base = {
    matterId: selection.matterId,
    forumPath: selection.forumPath,
    outputMode: selection.outputMode,
    officialHandoff: selection.officialHandoff,
    touchpoints: selection.touchpoints,
    touchpointControlOutputs: selection.touchpointControlOutputs,
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
        ...(selection.readinessOutcome
          ? { readinessOutcome: selection.readinessOutcome }
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
        selection.timelineContent,
        selection.touchpointControlOutputs,
        selection.carryForwardControls
      );
      const trustBinding = buildStructuralTrustBinding({
        kind: "PREP_PACK_COPY_READY",
        officialHandoff: selection.officialHandoff,
        ...(selection.readinessOutcome
          ? { readinessOutcome: selection.readinessOutcome }
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
        ...(input.touchpointPostureSnapshots
          ? { touchpointPostureSnapshots: input.touchpointPostureSnapshots }
          : {}),
        ...(selection.timelineContent
          ? { timelineContent: selection.timelineContent }
          : {}),
        ...(input.noticeReadiness
          ? { noticeReadiness: input.noticeReadiness }
          : {}),
        ...(br02ConsumerAssessment
          ? { br02ConsumerAssessment }
          : {}),
        ...(input.br01RoutingDecision
          ? { br01RoutingDecision: input.br01RoutingDecision }
          : {}),
        ...(input.br01ReferralFlags
          ? { br01ReferralFlags: input.br01ReferralFlags }
          : {}),
        ...(input.br01RoutingResult
          ? { br01RoutingResult: input.br01RoutingResult }
          : {}),
        ...(selection.readinessOutcome
          ? { readinessOutcome: selection.readinessOutcome }
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

export function createOutputPackageRecord(
  input: CreateOutputPackageRecordInput,
  privacyHookInput: OutputPackagePrivacyHookSourceInput = {}
): OutputPackage {
  const selection = selectOutputShell(input);
  const completeness = input.completeness
    ?? deriveOutputPackageCompleteness(selection.readinessOutcome);

  return {
    id: input.id,
    matterId: selection.matterId,
    outputMode: selection.outputMode,
    officialHandoff: selection.officialHandoff,
    ...(input.noticeDraftId ? { noticeDraftId: input.noticeDraftId } : {}),
    evidenceItemIds: input.evidenceItemIds ?? [],
    touchpointIds: selection.touchpoints.map((touchpoint) => touchpoint.id),
    carryForwardControls: selection.carryForwardControls,
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    completeness,
    privacyHooks: buildBr04PrivacyHooksFromSource({
      appliesTo: "OUTPUT_PACKAGE",
      source: privacyHookInput.source,
      policyKeys: privacyHookInput.policyKeys,
      accessScopeIds: privacyHookInput.accessScopeIds,
      hookOverrides: {
        lifecycleState: deriveOutputPackagePrivacyLifecycleState(completeness),
        ...(privacyHookInput.hookOverrides ?? {})
      }
    })
  };
}

function deriveOutputPackageCompleteness(
  readinessOutcome?: NoticeReadinessResult["outcome"]
): OutputPackage["completeness"] {
  return readinessOutcome === "READY_FOR_REVIEW"
    ? "READY_FOR_REVIEW"
    : "PARTIAL";
}

function deriveOutputPackagePrivacyLifecycleState(
  completeness: OutputPackage["completeness"]
): PrivacyLifecycleHooks["lifecycleState"] {
  return completeness === "READY_FOR_REVIEW"
    ? "NORMAL_LIFECYCLE"
    : "REVIEW_NEEDED";
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
  timelineContent?: OutputPackageTimelineContent,
  touchpointControlOutputs?: TouchpointControlOutputs,
  carryForwardControls?: readonly CarryForwardControl[]
): string[] {
  const touchpointConsequenceSurfaceKeys = touchpointControlOutputs
    ? deriveTouchpointConsequenceSurfaceKeys(touchpointControlOutputs)
    : [];
  const wrongChannelReroute = touchpointControlOutputs?.wrongChannelReroute === true;
  const hasReferralControl = hasCarryForwardControlSeverity(
    carryForwardControls,
    "REFERRAL"
  );

  if (!readinessContent && !timelineContent) {
    return dedupeStrings([
      ...touchpointConsequenceSurfaceKeys,
      ...(wrongChannelReroute || hasReferralControl ? ["referral-stop"] : []),
      ...(wrongChannelReroute || hasReferralControl ? [] : ["copy-ready-facts"]),
      "supporting-evidence-index",
      "guarded-review-flags"
    ]);
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

  blockKeys.push(...touchpointConsequenceSurfaceKeys);
  if (wrongChannelReroute || hasReferralControl) {
    blockKeys.push("referral-stop");
  }

  if (
    !wrongChannelReroute
    && shouldIncludeCopyReadyFacts(readinessContent, timelineContent)
  ) {
    blockKeys.push("copy-ready-facts");
  }

  blockKeys.push("supporting-evidence-index");

  return dedupeStrings(blockKeys);
}

function deriveDownstreamReadinessContent(input: {
  baseReadinessContent: OutputPackageReadinessContent | undefined;
  readinessOutcome: NoticeReadinessResult["outcome"] | undefined;
  carryForwardControls: CarryForwardControl[];
}): OutputPackageReadinessContent | undefined {
  if (!input.baseReadinessContent && !input.readinessOutcome) {
    return undefined;
  }

  const baseReadinessContent = input.baseReadinessContent;
  const readinessOutcome = input.readinessOutcome;
  const showReviewHoldPoints = readinessOutcome
    ? readinessOutcome === "BLOCKED"
      || readinessOutcome === "REVIEW_REQUIRED"
      || readinessOutcome === "REFER_OUT"
    : (baseReadinessContent?.showReviewHoldPoints ?? false);
  const hasGuardedCarryForwardControls = input.carryForwardControls.some((control) => (
    control.severity !== "INFO" && control.deterministic === false
  ));
  const showReferralStop = readinessOutcome === "REFER_OUT"
    || hasCarryForwardControlSeverity(input.carryForwardControls, "REFERRAL");
  const readinessOutcomeAllowsCopyReadyFacts = isCopyReadyFactsAllowed(readinessOutcome);
  const allowCopyReadyFacts = baseReadinessContent
    ? baseReadinessContent.allowCopyReadyFacts && readinessOutcomeAllowsCopyReadyFacts
    : readinessOutcomeAllowsCopyReadyFacts;

  return {
    carryForwardControls: input.carryForwardControls,
    showReadinessSummary: baseReadinessContent?.showReadinessSummary ?? true,
    showBlockerSummary: readinessOutcome === "BLOCKED"
      || (baseReadinessContent?.showBlockerSummary ?? false),
    showReviewHoldPoints,
    showGuardedIssueSection: (baseReadinessContent?.showGuardedIssueSection ?? false)
      || hasGuardedCarryForwardControls,
    showReferralStop,
    allowCopyReadyFacts
  };
}

function resolveDownstreamReadinessOutcome(
  outcomes: Array<NoticeReadinessResult["outcome"] | undefined>
): NoticeReadinessResult["outcome"] | undefined {
  const definedOutcomes = outcomes.filter((outcome): outcome is NoticeReadinessResult["outcome"] => (
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

function isCopyReadyFactsAllowed(
  readinessOutcome: NoticeReadinessResult["outcome"] | undefined
): boolean {
  return readinessOutcome === "READY_FOR_REVIEW"
    || readinessOutcome === "REVIEW_REQUIRED";
}

function hasCarryForwardControlSeverity(
  controls: readonly CarryForwardControl[] | undefined,
  severity: CarryForwardControl["severity"]
): boolean {
  return (controls ?? []).some((control) => control.severity === severity);
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

function dedupeStrings(values: readonly string[]): string[] {
  const seen = new Set<string>();

  return values.filter((value) => {
    if (seen.has(value)) {
      return false;
    }

    seen.add(value);
    return true;
  });
}

const readinessOutcomePriority: Record<NoticeReadinessResult["outcome"], number> = {
  READY_FOR_REVIEW: 0,
  REVIEW_REQUIRED: 1,
  REFER_OUT: 2,
  BLOCKED: 3
};

function resolveBr02DownstreamAssessment(
  input: OutputSelectionInput
): Br02DownstreamAssessment | undefined {
  const br02ConsumerAssessment = input.br02ConsumerAssessment;

  // Preserve the existing notice-readiness baseline when it is present; only use the nested BR02 consumer bundle for downstream BR02 bridging.
  if (input.noticeReadiness || !br02ConsumerAssessment) {
    return undefined;
  }

  return deriveBr02DownstreamAssessment({
    consumerAssessment: br02ConsumerAssessment
  });
}

export * from "./trustBindings.js";
export * from "./timelineAdapter.js";
export * from "./rendererStateAdapter.js";
