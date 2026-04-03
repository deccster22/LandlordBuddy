import type { EntityId } from "../../domain/model.js";
import type {
  ForumPathState,
  OfficialHandoffStateRecord
} from "../../domain/preparation.js";
import {
  mergeCarryForwardControls,
  type CarryForwardControl
} from "../../domain/posture.js";
import type { NoticeReadinessOutcome } from "../notice-readiness/index.js";
import {
  buildStructuralTrustBinding,
  type StructuralTrustBinding
} from "../output/trustBindings.js";
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
  const carryForwardControls = mergeCarryForwardControls(
    input.carryForwardControls ?? [],
    ...touchpoints.map((touchpoint) => touchpoint.carryForwardControls)
  );
  const boundaryCodes = [...officialHandoffBoundaryCodes];
  const guidanceBlockKeys = buildGuidanceBlockKeys(touchpoints, carryForwardControls);

  return {
    kind: "OFFICIAL_HANDOFF_GUIDANCE",
    matterId: input.matterId,
    forumPath: input.forumPath,
    officialHandoff: input.officialHandoff,
    boundaryCodes,
    guidanceBlockKeys,
    touchpoints,
    carryForwardControls,
    trustBinding: buildStructuralTrustBinding({
      kind: "OFFICIAL_HANDOFF_GUIDANCE",
      ...(input.readinessOutcome
        ? { readinessOutcome: input.readinessOutcome }
        : {}),
      blockKeys: guidanceBlockKeys,
      touchpoints,
      carryForwardControls,
      boundaryCodes
    })
  };
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
  carryForwardControls: CarryForwardControl[]
): string[] {
  const blockKeys = [
    "handoff-boundary",
    "external-action-owner",
    "review-before-official-step"
  ];

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
