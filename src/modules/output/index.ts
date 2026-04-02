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
import {
  deriveOutputPackageReadinessContent,
  type OutputPackageReadinessContent
} from "./readinessAdapter.js";
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
}

export interface OutputSelection {
  matterId: EntityId;
  forumPath: ForumPathState;
  outputMode: OutputModeState;
  officialHandoff: OfficialHandoffStateRecord;
  touchpoints: TouchpointMetadata[];
  carryForwardControls: CarryForwardControl[];
  readinessContent?: OutputPackageReadinessContent;
}

interface OutputPackageBase {
  matterId: EntityId;
  forumPath: ForumPathState;
  outputMode: OutputModeState;
  officialHandoff: OfficialHandoffStateRecord;
  touchpoints: TouchpointMetadata[];
  carryForwardControls: CarryForwardControl[];
  officialSystemAction: "NOT_INCLUDED";
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
  const carryForwardControls = mergeCarryForwardControls(
    input.carryForwardControls ?? [],
    ...(readinessContent ? [readinessContent.carryForwardControls] : []),
    ...touchpoints.map((touchpoint) => touchpoint.carryForwardControls)
  );

  return {
    matterId: input.matterId,
    forumPath: input.forumPath,
    outputMode: input.outputMode,
    officialHandoff: input.officialHandoff,
    touchpoints,
    carryForwardControls,
    ...(readinessContent ? { readinessContent } : {})
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
    officialSystemAction: "NOT_INCLUDED" as const
  };

  switch (selection.outputMode.mode) {
    case "PRINTABLE_OUTPUT":
      return {
        ...base,
        kind: "PRINTABLE_OUTPUT",
        sectionKeys: buildPrintableSectionKeys(selection.readinessContent)
      };
    case "PREP_PACK_COPY_READY":
      return {
        ...base,
        kind: "PREP_PACK_COPY_READY",
        blockKeys: buildPrepPackBlockKeys(selection.readinessContent)
      };
    case "OFFICIAL_HANDOFF_GUIDANCE":
      return {
        ...base,
        kind: "OFFICIAL_HANDOFF_GUIDANCE",
        guidance: buildOfficialHandoffGuidanceShell({
          matterId: selection.matterId,
          forumPath: selection.forumPath,
          officialHandoff: selection.officialHandoff,
          carryForwardControls: selection.carryForwardControls,
          touchpointIds: selection.touchpoints.map((touchpoint) => touchpoint.id)
        })
      };
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
  readinessContent?: OutputPackageReadinessContent
): string[] {
  if (!readinessContent) {
    return [
      "matter-summary",
      "arrears-snapshot",
      "source-index",
      "review-hold-points"
    ];
  }

  const sectionKeys = [
    "matter-summary",
    "arrears-snapshot",
    "readiness-summary",
    "source-index"
  ];

  if (readinessContent.showBlockerSummary) {
    sectionKeys.push("blocker-summary");
  }

  if (readinessContent.showReviewHoldPoints) {
    sectionKeys.push("review-hold-points");
  }

  if (readinessContent.showGuardedIssueSection) {
    sectionKeys.push("guarded-review-flags");
  }

  if (readinessContent.showReferralStop) {
    sectionKeys.push("referral-stop");
  }

  return sectionKeys;
}

function buildPrepPackBlockKeys(
  readinessContent?: OutputPackageReadinessContent
): string[] {
  if (!readinessContent) {
    return [
      "copy-ready-facts",
      "supporting-evidence-index",
      "guarded-review-flags"
    ];
  }

  const blockKeys = ["readiness-summary"];

  if (readinessContent.showBlockerSummary) {
    blockKeys.push("blocker-summary");
  }

  if (readinessContent.showReviewHoldPoints) {
    blockKeys.push("review-hold-points");
  }

  if (readinessContent.showGuardedIssueSection) {
    blockKeys.push("guarded-review-flags");
  }

  if (readinessContent.showReferralStop) {
    blockKeys.push("referral-stop");
  }

  if (readinessContent.allowCopyReadyFacts) {
    blockKeys.push("copy-ready-facts");
  }

  blockKeys.push("supporting-evidence-index");

  return blockKeys;
}
