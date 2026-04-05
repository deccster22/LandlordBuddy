import {
  GUARDED_INSERTION_POINTS,
  serviceMethodCodes,
  type RulePosture,
  type ServiceMethod
} from "../../domain/model.js";
import type {
  Br02FreshnessAuthority,
  Br02ValidatorArea
} from "./models.js";
import type { NoticeReadinessIssueSeverity } from "../notice-readiness/index.js";

export const br02DateRuleCategories = [
  "NOTICE_GATE",
  "SERVICE_METHOD_DATE",
  "CONSENT_GATE",
  "EVIDENCE_PREP",
  "HEARING_OVERRIDE"
] as const;

export type Br02DateRuleCategory = (typeof br02DateRuleCategories)[number];

export const br02DateRuleKinds = [
  "GATE_ONLY",
  "SERVICE_METHOD_AWARE",
  "PREP_STEP",
  "OVERRIDE_PRIORITY"
] as const;

export type Br02DateRuleKind = (typeof br02DateRuleKinds)[number];

export interface Br02DateRuleRegistryEntry {
  code: string;
  label: string;
  category: Br02DateRuleCategory;
  kind: Br02DateRuleKind;
  posture: RulePosture;
  serviceMethods: readonly ServiceMethod[];
  summary: string;
  qaHookIds: readonly string[];
  notes: readonly string[];
  guardedInsertionPoint?: string;
}

export const br02DateRuleRegistry: readonly Br02DateRuleRegistryEntry[] = Object.freeze([
  {
    code: "NO_EARLY_NOTICE_THRESHOLD_GATE",
    label: "No early notice threshold gate",
    category: "NOTICE_GATE",
    kind: "GATE_ONLY",
    posture: "DETERMINISTIC",
    serviceMethods: serviceMethodCodes,
    summary: "Notice preparation must stay closed until the arrears threshold shell is met.",
    qaHookIds: ["BR02-NO-EARLY-NOTICE"],
    notes: [
      "This is a gate shape only and does not imply filing or tribunal acceptance.",
      "Method-specific timing may still add guarded review after the gate opens."
    ]
  },
  {
    code: "REGISTERED_POST_SERVICE_DATE",
    label: "Registered post preferred deterministic path",
    category: "SERVICE_METHOD_DATE",
    kind: "SERVICE_METHOD_AWARE",
    posture: "DETERMINISTIC",
    serviceMethods: ["REGISTERED_POST"],
    summary: "Registered post is the preferred deterministic postal path in the current BR02 scaffold.",
    qaHookIds: ["BR02-SERVICE-METHODS", "BR02-REGISTERED-POST"],
    notes: [
      "This does not flatten every postal timing edge into one universal rule.",
      "Future official changes may require the registered-post assumption to be refreshed."
    ]
  },
  {
    code: "EMAIL_SERVICE_WITH_CONSENT",
    label: "Email service requires linked consent proof",
    category: "CONSENT_GATE",
    kind: "SERVICE_METHOD_AWARE",
    posture: "DETERMINISTIC",
    serviceMethods: ["EMAIL"],
    summary: "Email service is only deterministic when a linked consent proof exists for the renter and scope variation.",
    qaHookIds: ["BR02-SERVICE-METHODS", "BR02-EMAIL-CONSENT"],
    notes: [
      "Consent proof stays reusable per renter and scope variation.",
      "This scaffold checks linkage only and does not invent wider digital-service doctrine."
    ]
  },
  {
    code: "HAND_SERVICE_REVIEW_ONLY",
    label: "Hand service remains guarded",
    category: "SERVICE_METHOD_DATE",
    kind: "SERVICE_METHOD_AWARE",
    posture: "GUARDED",
    serviceMethods: ["HAND_DELIVERY"],
    summary: "Hand service remains reviewable and does not auto-become proof-sufficient in this phase.",
    qaHookIds: ["BR02-HAND-SERVICE-GUARDED"],
    notes: [
      "No code here should imply hand service is automatically sufficient.",
      "Guarded proof standards remain operator-reviewable until doctrine is settled."
    ],
    guardedInsertionPoint: GUARDED_INSERTION_POINTS.handServiceProof
  },
  {
    code: "EVIDENCE_PREP_REQUIRED_7_DAY_STEP",
    label: "7-day evidence prep step",
    category: "EVIDENCE_PREP",
    kind: "PREP_STEP",
    posture: "DETERMINISTIC",
    serviceMethods: serviceMethodCodes,
    summary: "The 7-day timing step is a required prep structure and must not be treated as a fake universal deadline truth.",
    qaHookIds: ["BR02-EVIDENCE-TIMING", "BR02-STALE-STATE"],
    notes: [
      "The prep step remains visible even when no hearing-specific instruction is attached.",
      "Generic timing copy must stay non-authoritative when stale or superseded."
    ]
  },
  {
    code: "HEARING_SPECIFIC_OVERRIDE_PRIORITY",
    label: "Hearing-specific override priority",
    category: "HEARING_OVERRIDE",
    kind: "OVERRIDE_PRIORITY",
    posture: "DETERMINISTIC",
    serviceMethods: serviceMethodCodes,
    summary: "Hearing-specific instructions outrank generic timing surfaces whenever both are present.",
    qaHookIds: ["BR02-EVIDENCE-TIMING"],
    notes: [
      "The precedence is settled even though the hearing instruction content remains external and freshness-sensitive.",
      "Generic timing surfaces must not outrank hearing-specific instructions."
    ]
  }
]);

export const br02ServiceMethodChannels = [
  "POSTAL",
  "DIGITAL",
  "PHYSICAL",
  "HANDOFF_ONLY",
  "UNKNOWN"
] as const;

export type Br02ServiceMethodChannel = (typeof br02ServiceMethodChannels)[number];

export const br02ServiceProofPostures = [
  "SUPPORTED",
  "CONSENT_GATED",
  "GUARDED_REVIEW",
  "HANDOFF_ONLY"
] as const;

export type Br02ServiceProofPosture = (typeof br02ServiceProofPostures)[number];

export interface Br02ServiceMethodRegistryEntry {
  code: ServiceMethod;
  label: string;
  channel: Br02ServiceMethodChannel;
  posture: RulePosture;
  preferredDeterministicPath: boolean;
  requiresConsentProof: boolean;
  consentScope?: "EMAIL_SERVICE";
  dateRuleCodes: readonly string[];
  proofPosture: Br02ServiceProofPosture;
  qaHookIds: readonly string[];
  notes: readonly string[];
  guardedInsertionPoint?: string;
}

export const br02ServiceMethodRegistry: readonly Br02ServiceMethodRegistryEntry[] = Object.freeze([
  {
    code: "REGISTERED_POST",
    label: "Registered post",
    channel: "POSTAL",
    posture: "DETERMINISTIC",
    preferredDeterministicPath: true,
    requiresConsentProof: false,
    dateRuleCodes: ["NO_EARLY_NOTICE_THRESHOLD_GATE", "REGISTERED_POST_SERVICE_DATE"],
    proofPosture: "SUPPORTED",
    qaHookIds: ["BR02-SERVICE-METHODS", "BR02-REGISTERED-POST"],
    notes: [
      "Preferred deterministic postal path for the current BR02 scaffold.",
      "Freshness checks still apply to live official assumptions."
    ]
  },
  {
    code: "POST",
    label: "Post (unspecified)",
    channel: "POSTAL",
    posture: "GUARDED",
    preferredDeterministicPath: false,
    requiresConsentProof: false,
    dateRuleCodes: ["NO_EARLY_NOTICE_THRESHOLD_GATE"],
    proofPosture: "GUARDED_REVIEW",
    qaHookIds: ["BR02-SERVICE-METHODS", "BR02-REGISTERED-POST"],
    notes: [
      "Unspecified postal service should not be silently treated as registered post.",
      "Keep postal timing nuance visible instead of flattening it into one truth."
    ],
    guardedInsertionPoint: GUARDED_INSERTION_POINTS.evidenceTiming
  },
  {
    code: "ORDINARY_POST",
    label: "Ordinary post",
    channel: "POSTAL",
    posture: "GUARDED",
    preferredDeterministicPath: false,
    requiresConsentProof: false,
    dateRuleCodes: ["NO_EARLY_NOTICE_THRESHOLD_GATE"],
    proofPosture: "GUARDED_REVIEW",
    qaHookIds: ["BR02-SERVICE-METHODS", "BR02-REGISTERED-POST"],
    notes: [
      "Ordinary post remains distinct from registered post in the registry.",
      "The scaffold does not collapse business-day and calendar-day assumptions together."
    ],
    guardedInsertionPoint: GUARDED_INSERTION_POINTS.evidenceTiming
  },
  {
    code: "EMAIL",
    label: "Email",
    channel: "DIGITAL",
    posture: "DETERMINISTIC",
    preferredDeterministicPath: false,
    requiresConsentProof: true,
    consentScope: "EMAIL_SERVICE",
    dateRuleCodes: ["NO_EARLY_NOTICE_THRESHOLD_GATE", "EMAIL_SERVICE_WITH_CONSENT"],
    proofPosture: "CONSENT_GATED",
    qaHookIds: ["BR02-SERVICE-METHODS", "BR02-EMAIL-CONSENT"],
    notes: [
      "Email service is deterministic only when linked consent proof exists.",
      "Consent proof remains reusable per renter and scope variation."
    ]
  },
  {
    code: "HAND_DELIVERY",
    label: "Hand delivery",
    channel: "PHYSICAL",
    posture: "GUARDED",
    preferredDeterministicPath: false,
    requiresConsentProof: false,
    dateRuleCodes: ["NO_EARLY_NOTICE_THRESHOLD_GATE", "HAND_SERVICE_REVIEW_ONLY"],
    proofPosture: "GUARDED_REVIEW",
    qaHookIds: ["BR02-SERVICE-METHODS", "BR02-HAND-SERVICE-GUARDED"],
    notes: [
      "Guarded hand-service posture is preserved explicitly.",
      "This does not imply hand service is auto-sufficient."
    ],
    guardedInsertionPoint: GUARDED_INSERTION_POINTS.handServiceProof
  },
  {
    code: "COURIER",
    label: "Courier",
    channel: "PHYSICAL",
    posture: "GUARDED",
    preferredDeterministicPath: false,
    requiresConsentProof: false,
    dateRuleCodes: ["NO_EARLY_NOTICE_THRESHOLD_GATE"],
    proofPosture: "GUARDED_REVIEW",
    qaHookIds: ["BR02-SERVICE-METHODS"],
    notes: [
      "Courier handling remains available as an extension point only.",
      "Do not treat courier proof as settled doctrine in this lane."
    ],
    guardedInsertionPoint: GUARDED_INSERTION_POINTS.handServiceProof
  },
  {
    code: "PORTAL_OR_OFFICIAL_SYSTEM",
    label: "Portal or official system",
    channel: "HANDOFF_ONLY",
    posture: "EXTERNAL",
    preferredDeterministicPath: false,
    requiresConsentProof: false,
    dateRuleCodes: ["NO_EARLY_NOTICE_THRESHOLD_GATE"],
    proofPosture: "HANDOFF_ONLY",
    qaHookIds: ["BR02-SERVICE-METHODS"],
    notes: [
      "Portal-specific implementation remains out of scope.",
      "Official-system behavior stays handoff-only and must not be mimicked here."
    ],
    guardedInsertionPoint: GUARDED_INSERTION_POINTS.portalBehavior
  },
  {
    code: "UNKNOWN",
    label: "Unknown service method",
    channel: "UNKNOWN",
    posture: "GUARDED",
    preferredDeterministicPath: false,
    requiresConsentProof: false,
    dateRuleCodes: ["NO_EARLY_NOTICE_THRESHOLD_GATE"],
    proofPosture: "GUARDED_REVIEW",
    qaHookIds: ["BR02-SERVICE-METHODS"],
    notes: [
      "Unknown method should remain visibly unresolved.",
      "Do not silently map unknown service method facts into a deterministic path."
    ],
    guardedInsertionPoint: GUARDED_INSERTION_POINTS.evidenceTiming
  }
]);

export const br02ValidatorCodes = [
  "NO_EARLY_NOTICE_GATE",
  "EMAIL_CONSENT_PROOF_REQUIRED",
  "REGISTERED_POST_PREFERRED_PATH",
  "HAND_SERVICE_REVIEW_REQUIRED",
  "STALE_REGISTERED_POST_ASSUMPTION",
  "STALE_GENERIC_TIMING_SURFACE"
] as const;

export type Br02ValidatorCode = (typeof br02ValidatorCodes)[number];

export interface Br02ValidatorSeverityRegistryEntry {
  code: Br02ValidatorCode;
  label: string;
  area: Br02ValidatorArea;
  severity: NoticeReadinessIssueSeverity;
  posture: RulePosture;
  summary: string;
  guardedInsertionPoint?: string;
}

export const br02ValidatorSeverityRegistry:
  readonly Br02ValidatorSeverityRegistryEntry[] = Object.freeze([
    {
      code: "NO_EARLY_NOTICE_GATE",
      label: "No early notice gate",
      area: "DATE",
      severity: "hard-stop",
      posture: "DETERMINISTIC",
      summary: "No early notice gate must remain closed until the threshold shell is met."
    },
    {
      code: "EMAIL_CONSENT_PROOF_REQUIRED",
      label: "Email consent proof required",
      area: "CONSENT",
      severity: "hard-stop",
      posture: "DETERMINISTIC",
      summary: "Email service requires linked consent proof before it can be treated as deterministic."
    },
    {
      code: "REGISTERED_POST_PREFERRED_PATH",
      label: "Registered post preferred path",
      area: "SERVICE",
      severity: "warning",
      posture: "DETERMINISTIC",
      summary: "Registered post remains the preferred deterministic postal path in the current scaffold."
    },
    {
      code: "HAND_SERVICE_REVIEW_REQUIRED",
      label: "Hand service review required",
      area: "SERVICE",
      severity: "slowdown",
      posture: "GUARDED",
      summary: "Hand service remains guarded and requires review before relying on proof sufficiency.",
      guardedInsertionPoint: GUARDED_INSERTION_POINTS.handServiceProof
    },
    {
      code: "STALE_REGISTERED_POST_ASSUMPTION",
      label: "Registered post freshness warning",
      area: "FRESHNESS",
      severity: "warning",
      posture: "GUARDED",
      summary: "Registered-post assumptions are freshness-sensitive and should be checked when stale.",
      guardedInsertionPoint: GUARDED_INSERTION_POINTS.touchpointFreshness
    },
    {
      code: "STALE_GENERIC_TIMING_SURFACE",
      label: "Generic timing freshness slowdown",
      area: "FRESHNESS",
      severity: "slowdown",
      posture: "GUARDED",
      summary: "Generic timing surfaces remain non-authoritative and should slow progression when stale.",
      guardedInsertionPoint: GUARDED_INSERTION_POINTS.touchpointFreshness
    }
  ]);

export const br02EvidenceTimingSourceKinds = [
  "SERVICE_EVENT_BASELINE",
  "REQUIRED_PREP_STEP",
  "HEARING_SPECIFIC_OVERRIDE"
] as const;

export type Br02EvidenceTimingSourceKind =
  (typeof br02EvidenceTimingSourceKinds)[number];

export interface Br02EvidenceTimingPrecedenceRegistryEntry {
  code: string;
  label: string;
  sourceKind: Br02EvidenceTimingSourceKind;
  posture: RulePosture;
  order: number;
  relativeTo: "SERVICE_EVENT" | "HEARING_DATE" | "HEARING_NOTICE";
  offsetDays?: number;
  dayCountKind?: "CALENDAR" | "BUSINESS";
  requiredPrepStep: boolean;
  universalDeadline: boolean;
  summary: string;
  qaHookIds: readonly string[];
  notes: readonly string[];
}

export const br02EvidenceTimingPrecedenceRegistry:
  readonly Br02EvidenceTimingPrecedenceRegistryEntry[] = Object.freeze([
    {
      code: "SERVICE_EVENT_BASELINE_CAPTURE",
      label: "Service-event baseline capture",
      sourceKind: "SERVICE_EVENT_BASELINE",
      posture: "DETERMINISTIC",
      order: 10,
      relativeTo: "SERVICE_EVENT",
      requiredPrepStep: false,
      universalDeadline: false,
      summary: "Keep one service-event row per renter per attempt and preserve that timing baseline for later evidence work.",
      qaHookIds: ["BR02-EVIDENCE-TIMING"],
      notes: [
        "This baseline captures timing facts without resolving every edge doctrine.",
        "Service-event timing should remain tied to the specific renter attempt row."
      ]
    },
    {
      code: "EVIDENCE_PREP_REQUIRED_7_DAY_STEP",
      label: "Required 7-day prep step",
      sourceKind: "REQUIRED_PREP_STEP",
      posture: "DETERMINISTIC",
      order: 20,
      relativeTo: "HEARING_DATE",
      offsetDays: 7,
      dayCountKind: "CALENDAR",
      requiredPrepStep: true,
      universalDeadline: false,
      summary: "The 7-day step is required prep structure only and not a universal deadline truth.",
      qaHookIds: ["BR02-EVIDENCE-TIMING", "BR02-STALE-STATE"],
      notes: [
        "This step should remain visible even when a hearing-specific instruction later overrides generic timing.",
        "Do not flatten this prep step into a fake universal evidence deadline."
      ]
    },
    {
      code: "HEARING_SPECIFIC_OVERRIDE_PRIORITY",
      label: "Hearing-specific override priority",
      sourceKind: "HEARING_SPECIFIC_OVERRIDE",
      posture: "DETERMINISTIC",
      order: 100,
      relativeTo: "HEARING_NOTICE",
      requiredPrepStep: false,
      universalDeadline: false,
      summary: "A hearing-specific instruction outranks generic timing surfaces whenever present.",
      qaHookIds: ["BR02-EVIDENCE-TIMING"],
      notes: [
        "The precedence is settled even though hearing-specific instruction content remains freshness-sensitive.",
        "Generic timing surfaces must not outrank hearing-specific instructions."
      ]
    }
  ]);

export const br02FreshnessStateCodes = [
  "CURRENT",
  "STALE_WARNING",
  "STALE_SLOWDOWN",
  "SUPERSEDED_BY_HEARING_OVERRIDE",
  "UNVERIFIED"
] as const;

export type Br02FreshnessStateCode = (typeof br02FreshnessStateCodes)[number];

export interface Br02FreshnessStateDefinition {
  code: Br02FreshnessStateCode;
  label: string;
  impact: "none" | NoticeReadinessIssueSeverity;
  authority: Br02FreshnessAuthority;
  summary: string;
}

export const br02FreshnessStateRegistry: readonly Br02FreshnessStateDefinition[] =
  Object.freeze([
    {
      code: "CURRENT",
      label: "Current",
      impact: "none",
      authority: "NON_AUTHORITATIVE",
      summary: "Current local view only. The scaffold still avoids claiming official parity."
    },
    {
      code: "STALE_WARNING",
      label: "Stale warning",
      impact: "warning",
      authority: "NON_AUTHORITATIVE",
      summary: "Surface is stale and should remain cautionary rather than universal truth."
    },
    {
      code: "STALE_SLOWDOWN",
      label: "Stale slowdown",
      impact: "slowdown",
      authority: "NON_AUTHORITATIVE",
      summary: "Surface is stale enough to slow progression and force review before reliance."
    },
    {
      code: "SUPERSEDED_BY_HEARING_OVERRIDE",
      label: "Superseded by hearing override",
      impact: "none",
      authority: "EXTERNAL_CHECK_REQUIRED",
      summary: "Generic timing surface has been superseded by a hearing-specific instruction."
    },
    {
      code: "UNVERIFIED",
      label: "Unverified",
      impact: "warning",
      authority: "NON_AUTHORITATIVE",
      summary: "Freshness has not yet been checked, so the surface must stay non-authoritative."
    }
  ]);

export const br02FreshnessMonitorAreas = [
  "REGISTERED_POST_ASSUMPTION",
  "GENERIC_EVIDENCE_TIMING",
  "HEARING_SPECIFIC_OVERRIDE"
] as const;

export type Br02FreshnessMonitorArea = (typeof br02FreshnessMonitorAreas)[number];

export interface Br02FreshnessMonitorRegistryEntry {
  code: string;
  label: string;
  area: Br02FreshnessMonitorArea;
  defaultStateCode: Br02FreshnessStateCode;
  staleStateCode: Br02FreshnessStateCode;
  authority: Br02FreshnessAuthority;
  neverUniversalDeadlineTruth: boolean;
  summary: string;
  qaHookIds: readonly string[];
  notes: readonly string[];
}

export const br02FreshnessMonitorRegistry:
  readonly Br02FreshnessMonitorRegistryEntry[] = Object.freeze([
    {
      code: "REGISTERED_POST_ASSUMPTION_MONITOR",
      label: "Registered post assumption monitor",
      area: "REGISTERED_POST_ASSUMPTION",
      defaultStateCode: "UNVERIFIED",
      staleStateCode: "STALE_WARNING",
      authority: "NON_AUTHORITATIVE",
      neverUniversalDeadlineTruth: true,
      summary: "Registered-post assumptions must remain freshness-sensitive and non-authoritative when stale.",
      qaHookIds: ["BR02-REGISTERED-POST", "BR02-STALE-STATE"],
      notes: [
        "Future official changes may require the registered-post preference to be refreshed.",
        "Stale monitor output should never be rendered as universal legal truth."
      ]
    },
    {
      code: "GENERIC_EVIDENCE_TIMING_MONITOR",
      label: "Generic evidence timing monitor",
      area: "GENERIC_EVIDENCE_TIMING",
      defaultStateCode: "UNVERIFIED",
      staleStateCode: "STALE_SLOWDOWN",
      authority: "NON_AUTHORITATIVE",
      neverUniversalDeadlineTruth: true,
      summary: "Generic evidence timing surfaces must remain non-authoritative and reviewable when stale.",
      qaHookIds: ["BR02-EVIDENCE-TIMING", "BR02-STALE-STATE"],
      notes: [
        "The 7-day prep step remains structural rather than universal truth.",
        "Stale generic timing must not outrank hearing-specific instructions."
      ]
    },
    {
      code: "HEARING_SPECIFIC_OVERRIDE_MONITOR",
      label: "Hearing-specific override monitor",
      area: "HEARING_SPECIFIC_OVERRIDE",
      defaultStateCode: "UNVERIFIED",
      staleStateCode: "STALE_WARNING",
      authority: "EXTERNAL_CHECK_REQUIRED",
      neverUniversalDeadlineTruth: true,
      summary: "Hearing-specific instructions remain external and should be checked for freshness before reliance.",
      qaHookIds: ["BR02-EVIDENCE-TIMING", "BR02-STALE-STATE"],
      notes: [
        "Generic copy must not outrank an attached hearing-specific instruction.",
        "This monitor preserves review posture without implying portal parity or official acceptance."
      ]
    }
  ]);
