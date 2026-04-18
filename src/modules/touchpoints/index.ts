import type { ForumPath } from "../../domain/preparation.js";
import type {
  ControlSeverity,
  CarryForwardControl,
  VisibleSourceType
} from "../../domain/posture.js";

export const touchpointClassifications = [
  "MIRROR",
  "MIRROR_WITH_WARNING",
  "DEFER_TO_LIVE_OFFICIAL_FLOW"
] as const;

export type TouchpointClassification = (typeof touchpointClassifications)[number];

export const touchpointFreshnessPostures = [
  "CURRENT",
  "STALE",
  "LIVE_CONFIRMATION_REQUIRED"
] as const;

export type TouchpointFreshnessPosture = (typeof touchpointFreshnessPostures)[number];

export const touchpointChannelPostures = [
  "IN_SCOPE_CHANNEL",
  "WRONG_CHANNEL_REROUTE"
] as const;

export type TouchpointChannelPosture = (typeof touchpointChannelPostures)[number];

export interface TouchpointPostureOverride {
  touchpointId: string;
  freshnessPosture?: TouchpointFreshnessPosture;
  channelPosture?: TouchpointChannelPosture;
}

export interface TouchpointResolutionInput {
  forumPath: ForumPath;
  touchpointIds?: readonly string[];
  postureOverrides?: readonly TouchpointPostureOverride[];
}

export interface ResolvedTouchpointPosture {
  touchpoint: TouchpointMetadata;
  freshnessPosture: TouchpointFreshnessPosture;
  channelPosture: TouchpointChannelPosture;
}

export interface TouchpointControlOutputs {
  stablePublicMirrorAllowed: boolean;
  publicMirrorAllowedWithWarning: boolean;
  deferToLiveOfficialFlow: boolean;
  authenticatedHandoffOnly: boolean;
  stale: boolean;
  liveConfirmationRequired: boolean;
  wrongChannelReroute: boolean;
}

export interface TouchpointControlResolution {
  touchpoints: TouchpointMetadata[];
  resolvedPostures: ResolvedTouchpointPosture[];
  carryForwardControls: CarryForwardControl[];
  controlOutputs: TouchpointControlOutputs;
}

export interface TouchpointMetadata {
  id: string;
  forumPath: ForumPath;
  placeholder: true;
  classification: TouchpointClassification;
  visibleSourceType: VisibleSourceType;
  area: "NOTICE_RULE" | "PUBLIC_FORM" | "AUTHENTICATED_SURFACE" | "GUIDANCE_FRESHNESS";
  defaultFreshnessPosture?: TouchpointFreshnessPosture;
  defaultChannelPosture?: TouchpointChannelPosture;
  carryForwardControls: CarryForwardControl[];
}

export const touchpointRegistryShell: readonly TouchpointMetadata[] = Object.freeze([
  {
    id: "vic-arrears-public-rule",
    forumPath: "VIC_VCAT_RENT_ARREARS",
    placeholder: true,
    classification: "MIRROR",
    visibleSourceType: "STABLE_RULE",
    area: "NOTICE_RULE",
    defaultFreshnessPosture: "CURRENT",
    defaultChannelPosture: "IN_SCOPE_CHANNEL",
    carryForwardControls: []
  },
  {
    id: "vic-arrears-public-form-warning",
    forumPath: "VIC_VCAT_RENT_ARREARS",
    placeholder: true,
    classification: "MIRROR_WITH_WARNING",
    visibleSourceType: "OFFICIAL_GUIDANCE",
    area: "PUBLIC_FORM",
    defaultFreshnessPosture: "CURRENT",
    defaultChannelPosture: "IN_SCOPE_CHANNEL",
    carryForwardControls: [
      {
        code: "PUBLIC_FORM_WARNING",
        severity: "WARNING",
        summary: "Public form logic can be prepared only with visible warning and review.",
        visibleSourceType: "OFFICIAL_GUIDANCE",
        deterministic: false,
        touchpointId: "vic-arrears-public-form-warning"
      }
    ]
  },
  {
    id: "vic-arrears-authenticated-handoff",
    forumPath: "VIC_VCAT_RENT_ARREARS",
    placeholder: true,
    classification: "DEFER_TO_LIVE_OFFICIAL_FLOW",
    visibleSourceType: "LIVE_PORTAL_OR_FORM_BEHAVIOR",
    area: "AUTHENTICATED_SURFACE",
    defaultFreshnessPosture: "CURRENT",
    defaultChannelPosture: "IN_SCOPE_CHANNEL",
    carryForwardControls: [
      {
        code: "AUTHENTICATED_TOUCHPOINT_HANDOFF_ONLY",
        severity: "SLOWDOWN",
        summary: "Authenticated official-system behavior stays handoff-only in this phase.",
        visibleSourceType: "LIVE_PORTAL_OR_FORM_BEHAVIOR",
        deterministic: false,
        guardedInsertionPoint: "Authenticated touchpoints remain handoff only.",
        touchpointId: "vic-arrears-authenticated-handoff"
      }
    ]
  },
  {
    id: "vic-arrears-freshness-watch",
    forumPath: "VIC_VCAT_RENT_ARREARS",
    placeholder: true,
    classification: "DEFER_TO_LIVE_OFFICIAL_FLOW",
    visibleSourceType: "UNRESOLVED_ITEM",
    area: "GUIDANCE_FRESHNESS",
    defaultFreshnessPosture: "CURRENT",
    defaultChannelPosture: "IN_SCOPE_CHANNEL",
    carryForwardControls: [
      {
        code: "FRESHNESS_SENSITIVE_SURFACE",
        severity: "WARNING",
        summary: "Freshness-sensitive surfaces require a current check before reliance.",
        visibleSourceType: "UNRESOLVED_ITEM",
        deterministic: false,
        touchpointId: "vic-arrears-freshness-watch"
      }
    ]
  }
]);

export function lookupTouchpointMetadata(id: string): TouchpointMetadata | undefined {
  return touchpointRegistryShell.find((touchpoint) => touchpoint.id === id);
}

export function listTouchpointsForForumPath(forumPath: ForumPath): TouchpointMetadata[] {
  return touchpointRegistryShell.filter((touchpoint) => touchpoint.forumPath === forumPath);
}

export function resolveTouchpointControl(
  input: TouchpointResolutionInput
): TouchpointControlResolution {
  const touchpoints = resolveTouchpoints(input.forumPath, input.touchpointIds);
  const postureOverridesById = new Map(
    (input.postureOverrides ?? []).map((override) => [override.touchpointId, override] as const)
  );
  const resolvedPostures = touchpoints.map((touchpoint) => {
    const postureOverride = postureOverridesById.get(touchpoint.id);

    return {
      touchpoint,
      freshnessPosture: postureOverride?.freshnessPosture
        ?? touchpoint.defaultFreshnessPosture
        ?? "CURRENT",
      channelPosture: postureOverride?.channelPosture
        ?? touchpoint.defaultChannelPosture
        ?? "IN_SCOPE_CHANNEL"
    };
  });
  const controlOutputs = deriveControlOutputs(resolvedPostures);
  const carryForwardControls = mergeTouchpointCarryForwardControls(resolvedPostures);

  return {
    touchpoints,
    resolvedPostures,
    carryForwardControls,
    controlOutputs
  };
}

function resolveTouchpoints(
  forumPath: ForumPath,
  touchpointIds?: readonly string[]
): TouchpointMetadata[] {
  if (!touchpointIds || touchpointIds.length === 0) {
    return listTouchpointsForForumPath(forumPath);
  }

  return touchpointIds.flatMap((touchpointId) => {
    const touchpoint = lookupTouchpointMetadata(touchpointId);
    return touchpoint && touchpoint.forumPath === forumPath ? [touchpoint] : [];
  });
}

function deriveControlOutputs(
  resolvedPostures: readonly ResolvedTouchpointPosture[]
): TouchpointControlOutputs {
  const outputs: TouchpointControlOutputs = {
    stablePublicMirrorAllowed: false,
    publicMirrorAllowedWithWarning: false,
    deferToLiveOfficialFlow: false,
    authenticatedHandoffOnly: false,
    stale: false,
    liveConfirmationRequired: false,
    wrongChannelReroute: false
  };

  for (const resolvedPosture of resolvedPostures) {
    const { touchpoint } = resolvedPosture;

    switch (touchpoint.classification) {
      case "MIRROR":
        outputs.stablePublicMirrorAllowed = true;
        break;
      case "MIRROR_WITH_WARNING":
        outputs.publicMirrorAllowedWithWarning = true;
        break;
      case "DEFER_TO_LIVE_OFFICIAL_FLOW":
        outputs.deferToLiveOfficialFlow = true;
        break;
    }

    if (touchpoint.area === "AUTHENTICATED_SURFACE") {
      outputs.authenticatedHandoffOnly = true;
    }

    if (resolvedPosture.freshnessPosture === "STALE") {
      outputs.stale = true;
    } else if (resolvedPosture.freshnessPosture === "LIVE_CONFIRMATION_REQUIRED") {
      outputs.liveConfirmationRequired = true;
    }

    if (resolvedPosture.channelPosture === "WRONG_CHANNEL_REROUTE") {
      outputs.wrongChannelReroute = true;
    }
  }

  return outputs;
}

function mergeTouchpointCarryForwardControls(
  resolvedPostures: readonly ResolvedTouchpointPosture[]
): CarryForwardControl[] {
  const merged = new Map<string, CarryForwardControl>();

  for (const resolvedPosture of resolvedPostures) {
    for (const control of resolvedPosture.touchpoint.carryForwardControls) {
      merged.set(`${control.code}::${control.touchpointId ?? ""}`, control);
    }

    for (const control of derivePostureControls(resolvedPosture)) {
      merged.set(`${control.code}::${control.touchpointId ?? ""}`, control);
    }
  }

  return [...merged.values()];
}

function derivePostureControls(
  posture: ResolvedTouchpointPosture
): CarryForwardControl[] {
  const controls: CarryForwardControl[] = [];

  if (posture.freshnessPosture === "STALE") {
    controls.push(buildDerivedControl({
      code: "TOUCHPOINT_STALE",
      severity: "WARNING",
      summary: "Touchpoint state is stale and should remain cautionary until refreshed.",
      touchpoint: posture.touchpoint
    }));
  }

  if (posture.freshnessPosture === "LIVE_CONFIRMATION_REQUIRED") {
    controls.push(buildDerivedControl({
      code: "TOUCHPOINT_LIVE_CONFIRMATION_REQUIRED",
      severity: "SLOWDOWN",
      summary: "Live confirmation is required before relying on this touchpoint.",
      touchpoint: posture.touchpoint
    }));
  }

  if (posture.channelPosture === "WRONG_CHANNEL_REROUTE") {
    controls.push(buildDerivedControl({
      code: "TOUCHPOINT_WRONG_CHANNEL_REROUTE",
      severity: "REFERRAL",
      summary: "Current channel is wrong or superseded; stop and reroute to the correct official flow.",
      touchpoint: posture.touchpoint
    }));
  }

  return controls;
}

function buildDerivedControl(input: {
  code: string;
  severity: ControlSeverity;
  summary: string;
  touchpoint: TouchpointMetadata;
}): CarryForwardControl {
  return {
    code: input.code,
    severity: input.severity,
    summary: input.summary,
    visibleSourceType: input.touchpoint.visibleSourceType,
    deterministic: false,
    touchpointId: input.touchpoint.id
  };
}
