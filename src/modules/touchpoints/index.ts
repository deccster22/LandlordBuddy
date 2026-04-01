import type { ForumPath } from "../../domain/preparation.js";
import type {
  CarryForwardControl,
  VisibleSourceType
} from "../../domain/posture.js";

export const touchpointClassifications = [
  "MIRRORABLE_PUBLIC_RULE_FORM",
  "MIRROR_WITH_WARNING",
  "HANDOFF_ONLY_AUTHENTICATED",
  "FRESHNESS_SENSITIVE"
] as const;

export type TouchpointClassification = (typeof touchpointClassifications)[number];

export interface TouchpointMetadata {
  id: string;
  forumPath: ForumPath;
  placeholder: true;
  classification: TouchpointClassification;
  visibleSourceType: VisibleSourceType;
  area: "NOTICE_RULE" | "PUBLIC_FORM" | "AUTHENTICATED_SURFACE" | "GUIDANCE_FRESHNESS";
  carryForwardControls: CarryForwardControl[];
}

export const touchpointRegistryShell: readonly TouchpointMetadata[] = Object.freeze([
  {
    id: "vic-arrears-public-rule",
    forumPath: "VIC_VCAT_RENT_ARREARS",
    placeholder: true,
    classification: "MIRRORABLE_PUBLIC_RULE_FORM",
    visibleSourceType: "STABLE_RULE",
    area: "NOTICE_RULE",
    carryForwardControls: []
  },
  {
    id: "vic-arrears-public-form-warning",
    forumPath: "VIC_VCAT_RENT_ARREARS",
    placeholder: true,
    classification: "MIRROR_WITH_WARNING",
    visibleSourceType: "OFFICIAL_GUIDANCE",
    area: "PUBLIC_FORM",
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
    classification: "HANDOFF_ONLY_AUTHENTICATED",
    visibleSourceType: "LIVE_PORTAL_OR_FORM_BEHAVIOR",
    area: "AUTHENTICATED_SURFACE",
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
    classification: "FRESHNESS_SENSITIVE",
    visibleSourceType: "UNRESOLVED_ITEM",
    area: "GUIDANCE_FRESHNESS",
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
