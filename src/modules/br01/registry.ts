import { GUARDED_INSERTION_POINTS } from "../../domain/model.js";
import type { Br01ScenarioRegistryEntry } from "./models.js";

export const br01ScenarioRegistry: readonly Br01ScenarioRegistryEntry[] = Object.freeze([
  {
    code: "OBJECTIVE_CAPTURE_REQUIRED",
    label: "Objective capture required",
    matchType: "SIGNAL_ONLY",
    requiredObjectives: [],
    outcomeFamily: "SLOWDOWN_REVIEW_REQUIRED",
    severity: "SLOWDOWN",
    posture: "GUARDED",
    summary: "Claim objectives must be captured before routing can proceed safely in arrears-first workflows.",
    defaultReasonCodes: ["OBJECTIVE_CAPTURE_REQUIRED"],
    guardedInsertionPoints: [GUARDED_INSERTION_POINTS.mixedClaimRouting],
    notes: [
      "Early objective capture prevents downstream work from advancing on an assumed forum path.",
      "This is a control stop for clarity, not legal advice."
    ]
  },
  {
    code: "ARREARS_ONLY",
    label: "Arrears only",
    matchType: "EXACT",
    requiredObjectives: ["ARREARS"],
    outcomeFamily: "DETERMINISTIC_ROUTE_ALLOWED",
    severity: "INFO",
    posture: "DETERMINISTIC",
    summary: "Arrears-only objective can continue on the deterministic arrears-first route.",
    defaultReasonCodes: ["ARREARS_ONLY_ROUTE_ALLOWED"],
    guardedInsertionPoints: [],
    notes: [
      "Deterministic routing here does not imply filing, legal sufficiency, or official acceptance.",
      "Forum, output mode, and handoff state still remain separate dimensions."
    ]
  },
  {
    code: "ARREARS_PLUS_REPAIRS",
    label: "Arrears plus repairs",
    matchType: "INCLUDES",
    requiredObjectives: ["ARREARS", "REPAIRS"],
    outcomeFamily: "SLOWDOWN_REVIEW_REQUIRED",
    severity: "SLOWDOWN",
    posture: "GUARDED",
    summary: "Arrears with repairs should slow down for review before routing proceeds.",
    defaultReasonCodes: ["ARREARS_PLUS_REPAIRS_SLOWDOWN"],
    guardedInsertionPoints: [GUARDED_INSERTION_POINTS.mixedClaimRouting],
    notes: [
      "Repairs intersections remain review-led in this first BR01 routing layer.",
      "Do not flatten repairs into ordinary arrears-only progression."
    ]
  },
  {
    code: "ARREARS_PLUS_COMPENSATION",
    label: "Arrears plus compensation",
    matchType: "INCLUDES",
    requiredObjectives: ["ARREARS", "COMPENSATION"],
    outcomeFamily: "SPLIT_MATTER_REQUIRED",
    severity: "SLOWDOWN",
    posture: "GUARDED",
    summary: "Arrears plus compensation should remain split-matter and must not be flattened into one route.",
    defaultReasonCodes: ["SPLIT_MATTER_COMPENSATION"],
    guardedInsertionPoints: [GUARDED_INSERTION_POINTS.mixedClaimRouting],
    notes: [
      "Objective-first routing remains explicit for mixed monetary/remedy posture.",
      "Split-matter output signals insertion points rather than final forum doctrine."
    ]
  },
  {
    code: "ARREARS_PLUS_DAMAGE",
    label: "Arrears plus damage",
    matchType: "INCLUDES",
    requiredObjectives: ["ARREARS", "DAMAGE"],
    outcomeFamily: "SPLIT_MATTER_REQUIRED",
    severity: "SLOWDOWN",
    posture: "GUARDED",
    summary: "Arrears plus damage should remain split-matter and review-led.",
    defaultReasonCodes: ["SPLIT_MATTER_DAMAGE"],
    guardedInsertionPoints: [GUARDED_INSERTION_POINTS.mixedClaimRouting],
    notes: [
      "Damage intersections can change route posture and should not be collapsed into a single conveyor path.",
      "This layer preserves separation without asserting full doctrine."
    ]
  },
  {
    code: "ARREARS_PLUS_BOND_ISSUES",
    label: "Arrears plus bond issues",
    matchType: "INCLUDES",
    requiredObjectives: ["ARREARS", "BOND_ISSUES"],
    outcomeFamily: "SPLIT_MATTER_REQUIRED",
    severity: "SLOWDOWN",
    posture: "GUARDED",
    summary: "Arrears plus bond issues should remain split-matter and explicitly review-led.",
    defaultReasonCodes: ["SPLIT_MATTER_BOND_ISSUES"],
    guardedInsertionPoints: [GUARDED_INSERTION_POINTS.mixedClaimRouting],
    notes: [
      "Bond-related posture should stay explicit and separate from pure arrears progression.",
      "No claim of final legal path selection is made here."
    ]
  },
  {
    code: "ARREARS_PLUS_QUIET_ENJOYMENT",
    label: "Arrears plus quiet enjoyment",
    matchType: "INCLUDES",
    requiredObjectives: ["ARREARS", "QUIET_ENJOYMENT"],
    outcomeFamily: "SPLIT_MATTER_REQUIRED",
    severity: "SLOWDOWN",
    posture: "GUARDED",
    summary: "Arrears plus quiet enjoyment should stay split-matter and should not be flattened.",
    defaultReasonCodes: ["SPLIT_MATTER_QUIET_ENJOYMENT"],
    guardedInsertionPoints: [GUARDED_INSERTION_POINTS.mixedClaimRouting],
    notes: [
      "Mixed objective posture remains explicit and reviewable.",
      "Routing here should preserve insertion points for later forum-specific handling."
    ]
  },
  {
    code: "ARREARS_PLUS_FAMILY_VIOLENCE_SENSITIVE",
    label: "Arrears plus family-violence-sensitive circumstances",
    matchType: "INCLUDES",
    requiredObjectives: ["ARREARS", "FAMILY_VIOLENCE_SENSITIVE"],
    outcomeFamily: "REFERRAL_REQUIRED",
    severity: "REFERRAL",
    posture: "GUARDED",
    summary: "Family-violence-sensitive circumstances require referral-first handling in this lane.",
    defaultReasonCodes: ["FAMILY_VIOLENCE_SENSITIVE_REFERRAL"],
    guardedInsertionPoints: [GUARDED_INSERTION_POINTS.mixedClaimRouting],
    notes: [
      "Sensitive scenarios must not be forced into deterministic routing.",
      "Referral posture is a control boundary, not legal advice."
    ]
  },
  {
    code: "ARREARS_MIXED_OBJECTIVES_GUARDED",
    label: "Arrears mixed objectives guarded",
    matchType: "SIGNAL_ONLY",
    requiredObjectives: ["ARREARS"],
    outcomeFamily: "SLOWDOWN_REVIEW_REQUIRED",
    severity: "SLOWDOWN",
    posture: "GUARDED",
    summary: "Mixed arrears objectives remain guarded when no deterministic BR01 scenario match exists.",
    defaultReasonCodes: ["MIXED_OBJECTIVES_GUARDED"],
    guardedInsertionPoints: [GUARDED_INSERTION_POINTS.mixedClaimRouting],
    notes: [
      "Fallback keeps unresolved combinations visible instead of silently routing.",
      "Later BR01 doctrine can replace this with tighter deterministic rows."
    ]
  },
  {
    code: "ARREARS_OBJECTIVE_MISSING_ROUTE_OUT",
    label: "Arrears objective missing route-out",
    matchType: "SIGNAL_ONLY",
    requiredObjectives: [],
    outcomeFamily: "ROUTE_OUT_REQUIRED",
    severity: "REFERRAL",
    posture: "GUARDED",
    summary: "Arrears objective is missing, so the arrears-first lane should route out rather than guess.",
    defaultReasonCodes: ["ARREARS_OBJECTIVE_MISSING"],
    guardedInsertionPoints: [GUARDED_INSERTION_POINTS.mixedClaimRouting],
    notes: [
      "Objective-first routing is preserved by refusing silent fallback into arrears progression.",
      "Route-out remains explicit and external-facing."
    ]
  },
  {
    code: "INTERSTATE_OR_NON_VICTORIA_ROUTE_OUT",
    label: "Interstate party or non-Victoria route-out",
    matchType: "SIGNAL_ONLY",
    requiredObjectives: [],
    outcomeFamily: "ROUTE_OUT_REQUIRED",
    severity: "REFERRAL",
    posture: "EXTERNAL",
    summary: "Interstate or non-supported jurisdiction posture routes out of the in-scope Victorian arrears lane.",
    defaultReasonCodes: ["INTERSTATE_PARTY_ROUTE_OUT"],
    guardedInsertionPoints: [GUARDED_INSERTION_POINTS.mixedClaimRouting],
    notes: [
      "Route-out keeps unsupported forum posture explicit and avoids false confidence.",
      "This does not provide legal path selection; it preserves a referral boundary."
    ]
  }
]);
