import {
  visibleSourceTypes,
  type CarryForwardControl,
  type VisibleSourceType
} from "../../domain/posture.js";
import type { NoticeReadinessOutcome } from "../notice-readiness/index.js";
import type { TouchpointMetadata } from "../touchpoints/index.js";

export const structuralTrustBindingKinds = [
  "PRINTABLE_OUTPUT",
  "PREP_PACK_COPY_READY",
  "OFFICIAL_HANDOFF_GUIDANCE"
] as const;

export type StructuralTrustBindingKind =
  (typeof structuralTrustBindingKinds)[number];

export const structuralTrustReadinessOutcomes = [
  "NOT_EVALUATED",
  "READY_FOR_REVIEW",
  "BLOCKED",
  "REVIEW_REQUIRED",
  "REFER_OUT"
] as const;

export type StructuralTrustReadinessOutcome =
  (typeof structuralTrustReadinessOutcomes)[number];

export const structuralTrustSurfaceSlotKinds = [
  "SECTION",
  "BLOCK"
] as const;

export type StructuralTrustSurfaceSlotKind =
  (typeof structuralTrustSurfaceSlotKinds)[number];

export const structuralTrustEmphasisZones = [
  "GENERAL",
  "REVIEW",
  "BLOCKER",
  "REFERRAL"
] as const;

export type StructuralTrustEmphasisZone =
  (typeof structuralTrustEmphasisZones)[number];

export interface VisibleSourceTypeLabelBinding {
  sourceType: VisibleSourceType;
  labelKey: string;
}

export interface StructuralTrustSurfaceBinding {
  slotKind: StructuralTrustSurfaceSlotKind;
  surfaceKey: string;
  trustSurfaceKeys: string[];
  boundaryStatementKeys: string[];
  trustCueKeys: string[];
  emphasisZone: StructuralTrustEmphasisZone;
}

export interface StructuralTrustBinding {
  kind: StructuralTrustBindingKind;
  schemaKey: string;
  readinessOutcome: StructuralTrustReadinessOutcome;
  boundaryStatementKeys: string[];
  boundaryStatementKeysByCode: Record<string, string>;
  readinessSummarySupportKeys: string[];
  reviewStateKeys: string[];
  trustCueKeys: string[];
  progressionAffordanceKeys: string[];
  visibleSourceTypeLabels: VisibleSourceTypeLabelBinding[];
  surfaceBindings: StructuralTrustSurfaceBinding[];
}

export interface StructuralTrustBindingInput {
  kind: StructuralTrustBindingKind;
  readinessOutcome?: NoticeReadinessOutcome;
  sectionKeys?: readonly string[];
  blockKeys?: readonly string[];
  touchpoints: readonly TouchpointMetadata[];
  carryForwardControls: readonly CarryForwardControl[];
  boundaryCodes?: readonly string[];
}

interface StructuralTrustSurfaceTemplate {
  trustSurfaceKeys: readonly string[];
  boundaryStatementKeys: readonly string[];
  trustCueKeys: readonly string[];
  emphasisZone: StructuralTrustEmphasisZone;
}

export const visibleSourceTypeLabelKeyBySourceType = Object.freeze({
  STABLE_RULE: "source-label.stable-rule",
  OFFICIAL_GUIDANCE: "source-label.official-guidance",
  LIVE_PORTAL_OR_FORM_BEHAVIOR: "source-label.live-portal-or-form-behavior",
  UNRESOLVED_ITEM: "source-label.unresolved-item"
});

export const boundaryStatementKeyByCode = Object.freeze({
  PREP_AND_HANDOFF_ONLY: "boundary.prep-and-handoff-only",
  NO_PRODUCT_SUBMISSION: "boundary.no-product-submission",
  NO_PORTAL_MIMICRY: "boundary.no-portal-mimicry"
});

const surfaceTrustTemplateByKey: Readonly<Record<string, StructuralTrustSurfaceTemplate>> =
  Object.freeze({
    "matter-summary": {
      trustSurfaceKeys: ["surface.matter-summary", "surface.local-matter-snapshot"],
      boundaryStatementKeys: [],
      trustCueKeys: ["trust-cue.local-matter-snapshot"],
      emphasisZone: "GENERAL"
    },
    "arrears-snapshot": {
      trustSurfaceKeys: ["surface.arrears-snapshot", "surface.local-arrears-snapshot"],
      boundaryStatementKeys: [],
      trustCueKeys: ["trust-cue.local-arrears-snapshot"],
      emphasisZone: "GENERAL"
    },
    "readiness-summary": {
      trustSurfaceKeys: ["surface.readiness-summary", "surface.readiness-outcome"],
      boundaryStatementKeys: ["boundary.readiness-not-filing"],
      trustCueKeys: ["trust-cue.readiness-summary"],
      emphasisZone: "REVIEW"
    },
    "source-index": {
      trustSurfaceKeys: ["surface.source-index", "surface.visible-source-labels"],
      boundaryStatementKeys: [],
      trustCueKeys: ["trust-cue.visible-source-labels"],
      emphasisZone: "GENERAL"
    },
    "sequencing-summary": {
      trustSurfaceKeys: [
        "surface.sequencing-summary",
        "surface.timeline-sequencing-visibility"
      ],
      boundaryStatementKeys: ["boundary.readiness-not-filing"],
      trustCueKeys: ["trust-cue.sequencing-summary-visible"],
      emphasisZone: "GENERAL"
    },
    "blocker-summary": {
      trustSurfaceKeys: ["surface.blocker-summary", "surface.progression-held"],
      boundaryStatementKeys: ["boundary.readiness-not-filing"],
      trustCueKeys: ["trust-cue.blocker-summary"],
      emphasisZone: "BLOCKER"
    },
    "sequencing-blocked": {
      trustSurfaceKeys: [
        "surface.sequencing-blocked",
        "surface.upstream-prerequisites-unsatisfied"
      ],
      boundaryStatementKeys: ["boundary.readiness-not-filing"],
      trustCueKeys: ["trust-cue.sequencing-blocked"],
      emphasisZone: "BLOCKER"
    },
    "review-hold-points": {
      trustSurfaceKeys: ["surface.review-hold-points", "surface.review-queue"],
      boundaryStatementKeys: ["boundary.readiness-not-filing"],
      trustCueKeys: ["trust-cue.review-hold"],
      emphasisZone: "REVIEW"
    },
    "dependency-hold-points": {
      trustSurfaceKeys: ["surface.dependency-hold-points", "surface.next-step-holds"],
      boundaryStatementKeys: ["boundary.readiness-not-filing"],
      trustCueKeys: ["trust-cue.dependency-hold-points"],
      emphasisZone: "REVIEW"
    },
    "guarded-review-flags": {
      trustSurfaceKeys: ["surface.guarded-review-flags", "surface.unresolved-doctrine"],
      boundaryStatementKeys: [],
      trustCueKeys: ["trust-cue.guarded-review-flags"],
      emphasisZone: "REVIEW"
    },
    "sequencing-guarded": {
      trustSurfaceKeys: [
        "surface.sequencing-guarded",
        "surface.guarded-sequencing-visible"
      ],
      boundaryStatementKeys: [],
      trustCueKeys: ["trust-cue.sequencing-guarded"],
      emphasisZone: "REVIEW"
    },
    "external-step-summary": {
      trustSurfaceKeys: [
        "surface.external-step-summary",
        "surface.external-handoff-dependent"
      ],
      boundaryStatementKeys: ["boundary.handoff-not-completed-official-step"],
      trustCueKeys: ["trust-cue.external-step-summary"],
      emphasisZone: "REVIEW"
    },
    "referral-stop": {
      trustSurfaceKeys: ["surface.referral-stop", "surface.no-standard-progression"],
      boundaryStatementKeys: ["boundary.readiness-not-filing"],
      trustCueKeys: ["trust-cue.referral-stop"],
      emphasisZone: "REFERRAL"
    },
    "copy-ready-facts": {
      trustSurfaceKeys: ["surface.copy-ready-facts", "surface.copy-ready-facts-gated"],
      boundaryStatementKeys: ["boundary.readiness-not-filing"],
      trustCueKeys: ["trust-cue.copy-ready-facts-gated"],
      emphasisZone: "REVIEW"
    },
    "supporting-evidence-index": {
      trustSurfaceKeys: ["surface.supporting-evidence-index", "surface.local-evidence-links"],
      boundaryStatementKeys: ["boundary.local-validation-not-official-acceptance"],
      trustCueKeys: ["trust-cue.local-evidence-index"],
      emphasisZone: "GENERAL"
    },
    "handoff-boundary": {
      trustSurfaceKeys: ["surface.handoff-boundary", "surface.boundary-codes"],
      boundaryStatementKeys: [
        "boundary.prep-and-handoff-only",
        "boundary.no-product-submission",
        "boundary.no-portal-mimicry"
      ],
      trustCueKeys: ["trust-cue.boundary-codes-visible"],
      emphasisZone: "GENERAL"
    },
    "external-action-owner": {
      trustSurfaceKeys: ["surface.external-action-owner", "surface.user-or-operator-action"],
      boundaryStatementKeys: ["boundary.handoff-not-completed-official-step"],
      trustCueKeys: ["trust-cue.external-action-owner"],
      emphasisZone: "REVIEW"
    },
    "review-before-official-step": {
      trustSurfaceKeys: [
        "surface.review-before-official-step",
        "surface.review-gate-before-handoff"
      ],
      boundaryStatementKeys: [
        "boundary.readiness-not-filing",
        "boundary.handoff-not-completed-official-step"
      ],
      trustCueKeys: ["trust-cue.review-before-official-step"],
      emphasisZone: "REVIEW"
    },
    "authenticated-surface-handoff": {
      trustSurfaceKeys: [
        "surface.authenticated-surface-handoff",
        "surface.authenticated-surface-external"
      ],
      boundaryStatementKeys: ["boundary.no-portal-mimicry"],
      trustCueKeys: ["trust-cue.authenticated-surface-handoff-only"],
      emphasisZone: "REVIEW"
    },
    "freshness-check": {
      trustSurfaceKeys: ["surface.freshness-check", "surface.current-guidance-check"],
      boundaryStatementKeys: [],
      trustCueKeys: ["trust-cue.freshness-check"],
      emphasisZone: "GENERAL"
    },
    "slowdown-review": {
      trustSurfaceKeys: ["surface.slowdown-review", "surface.review-slowdown"],
      boundaryStatementKeys: ["boundary.handoff-not-completed-official-step"],
      trustCueKeys: ["trust-cue.slowdown-review"],
      emphasisZone: "REVIEW"
    }
  });

export function buildStructuralTrustBinding(
  input: StructuralTrustBindingInput
): StructuralTrustBinding {
  const readinessOutcome = input.readinessOutcome ?? "NOT_EVALUATED";
  const surfaceKeys = input.kind === "PRINTABLE_OUTPUT"
    ? [...(input.sectionKeys ?? [])]
    : [...(input.blockKeys ?? [])];
  const slotKind = input.kind === "PRINTABLE_OUTPUT" ? "SECTION" : "BLOCK";
  const boundaryStatementKeysByCode = mapBoundaryCodesToStatementKeys(
    input.boundaryCodes ?? []
  );
  const surfaceBindings = surfaceKeys.map((surfaceKey) => buildSurfaceBinding({
    slotKind,
    surfaceKey
  }));

  return {
    kind: input.kind,
    schemaKey: buildSchemaKey(input.kind, readinessOutcome),
    readinessOutcome,
    boundaryStatementKeys: dedupeStrings([
      ...buildPackageBoundaryStatementKeys(input.kind),
      ...Object.values(boundaryStatementKeysByCode),
      ...surfaceBindings.flatMap((binding) => binding.boundaryStatementKeys)
    ]),
    boundaryStatementKeysByCode,
    readinessSummarySupportKeys: buildReadinessSummarySupportKeys(readinessOutcome),
    reviewStateKeys: buildReviewStateKeys({
      kind: input.kind,
      readinessOutcome,
      surfaceKeys
    }),
    trustCueKeys: dedupeStrings([
      ...buildPackageTrustCueKeys(input.kind),
      ...buildOutcomeTrustCueKeys(readinessOutcome),
      ...surfaceBindings.flatMap((binding) => binding.trustCueKeys)
    ]),
    progressionAffordanceKeys: buildProgressionAffordanceKeys({
      kind: input.kind,
      readinessOutcome,
      surfaceKeys
    }),
    visibleSourceTypeLabels: buildVisibleSourceTypeLabels({
      touchpoints: input.touchpoints,
      carryForwardControls: input.carryForwardControls
    }),
    surfaceBindings
  };
}

export function mapBoundaryCodesToStatementKeys(
  boundaryCodes: readonly string[]
): Record<string, string> {
  return boundaryCodes.reduce<Record<string, string>>((mapped, boundaryCode) => {
    mapped[boundaryCode] = boundaryStatementKeyByCode[
      boundaryCode as keyof typeof boundaryStatementKeyByCode
    ] ?? `boundary.${normalizeCodeKey(boundaryCode)}`;
    return mapped;
  }, {});
}

function buildVisibleSourceTypeLabels(input: {
  touchpoints: readonly TouchpointMetadata[];
  carryForwardControls: readonly CarryForwardControl[];
}): VisibleSourceTypeLabelBinding[] {
  const visibleSourceTypeSet = new Set<VisibleSourceType>();

  for (const touchpoint of input.touchpoints) {
    visibleSourceTypeSet.add(touchpoint.visibleSourceType);
  }

  for (const control of input.carryForwardControls) {
    visibleSourceTypeSet.add(control.visibleSourceType);
  }

  return visibleSourceTypes
    .filter((sourceType) => visibleSourceTypeSet.has(sourceType))
    .map((sourceType) => ({
      sourceType,
      labelKey: visibleSourceTypeLabelKeyBySourceType[sourceType]
    }));
}

function buildSurfaceBinding(input: {
  slotKind: StructuralTrustSurfaceSlotKind;
  surfaceKey: string;
}): StructuralTrustSurfaceBinding {
  const template = surfaceTrustTemplateByKey[input.surfaceKey];

  return {
    slotKind: input.slotKind,
    surfaceKey: input.surfaceKey,
    trustSurfaceKeys: template
      ? [...template.trustSurfaceKeys]
      : [`surface.${input.surfaceKey}`],
    boundaryStatementKeys: template ? [...template.boundaryStatementKeys] : [],
    trustCueKeys: template ? [...template.trustCueKeys] : [],
    emphasisZone: template?.emphasisZone ?? "GENERAL"
  };
}

function buildPackageBoundaryStatementKeys(
  kind: StructuralTrustBindingKind
): string[] {
  if (kind === "OFFICIAL_HANDOFF_GUIDANCE") {
    return [
      "boundary.no-product-submission",
      "boundary.readiness-not-filing",
      "boundary.handoff-not-completed-official-step"
    ];
  }

  return [
    "boundary.no-product-submission",
    "boundary.local-validation-not-official-acceptance",
    "boundary.readiness-not-filing"
  ];
}

function buildPackageTrustCueKeys(
  kind: StructuralTrustBindingKind
): string[] {
  switch (kind) {
    case "PRINTABLE_OUTPUT":
      return ["trust-cue.printable-structure-only"];
    case "PREP_PACK_COPY_READY":
      return ["trust-cue.prep-pack-structure-only"];
    case "OFFICIAL_HANDOFF_GUIDANCE":
      return [
        "trust-cue.handoff-guidance-structure-only",
        "trust-cue.official-step-remains-external"
      ];
  }
}

function buildOutcomeTrustCueKeys(
  readinessOutcome: StructuralTrustReadinessOutcome
): string[] {
  switch (readinessOutcome) {
    case "NOT_EVALUATED":
      return ["trust-cue.readiness-binding-pending"];
    case "READY_FOR_REVIEW":
      return ["trust-cue.ready-for-review-local-only"];
    case "BLOCKED":
      return ["trust-cue.blocker-specific-hold"];
    case "REVIEW_REQUIRED":
      return ["trust-cue.slowdown-review-visible"];
    case "REFER_OUT":
      return ["trust-cue.referral-stop"];
  }
}

function buildReadinessSummarySupportKeys(
  readinessOutcome: StructuralTrustReadinessOutcome
): string[] {
  switch (readinessOutcome) {
    case "NOT_EVALUATED":
      return ["support.readiness-structure-pending"];
    case "READY_FOR_REVIEW":
      return [
        "support.readiness-local-review-ready",
        "support.review-still-required-before-official-step"
      ];
    case "BLOCKED":
      return [
        "support.readiness-blocker-summary",
        "support.local-blocked-state"
      ];
    case "REVIEW_REQUIRED":
      return [
        "support.readiness-slowdown-review",
        "support.review-still-required-before-official-step"
      ];
    case "REFER_OUT":
      return [
        "support.readiness-referral-stop",
        "support.referral-handoff-required"
      ];
  }
}

function buildReviewStateKeys(input: {
  kind: StructuralTrustBindingKind;
  readinessOutcome: StructuralTrustReadinessOutcome;
  surfaceKeys: readonly string[];
}): string[] {
  const reviewStateKeys = ["review-state.human-review-required"];

  switch (input.readinessOutcome) {
    case "NOT_EVALUATED":
      reviewStateKeys.push("review-state.readiness-pending");
      break;
    case "READY_FOR_REVIEW":
      reviewStateKeys.push("review-state.ready-for-review");
      break;
    case "BLOCKED":
      reviewStateKeys.push("review-state.blocked");
      break;
    case "REVIEW_REQUIRED":
      reviewStateKeys.push("review-state.slowdown-review-required");
      break;
    case "REFER_OUT":
      reviewStateKeys.push("review-state.refer-out");
      break;
  }

  if (input.kind === "OFFICIAL_HANDOFF_GUIDANCE") {
    reviewStateKeys.push("review-state.official-step-external");
  }

  if (input.surfaceKeys.includes("sequencing-blocked")) {
    reviewStateKeys.push("review-state.sequencing-blocked");
  }

  if (input.surfaceKeys.includes("dependency-hold-points")) {
    reviewStateKeys.push("review-state.dependency-holds-visible");
  }

  if (input.surfaceKeys.includes("guarded-review-flags")) {
    reviewStateKeys.push("review-state.guarded-items-visible");
  }

  if (input.surfaceKeys.includes("sequencing-guarded")) {
    reviewStateKeys.push("review-state.sequencing-guarded");
  }

  if (input.surfaceKeys.includes("external-step-summary")) {
    reviewStateKeys.push("review-state.official-step-external");
  }

  return dedupeStrings(reviewStateKeys);
}

function buildProgressionAffordanceKeys(input: {
  kind: StructuralTrustBindingKind;
  readinessOutcome: StructuralTrustReadinessOutcome;
  surfaceKeys: readonly string[];
}): string[] {
  if (
    input.kind === "PREP_PACK_COPY_READY"
    && input.surfaceKeys.includes("copy-ready-facts")
    && (
      input.readinessOutcome === "READY_FOR_REVIEW"
      || input.readinessOutcome === "REVIEW_REQUIRED"
    )
  ) {
    return ["progression.copy-ready-facts"];
  }

  return [];
}

function buildSchemaKey(
  kind: StructuralTrustBindingKind,
  readinessOutcome: StructuralTrustReadinessOutcome
): string {
  return `trust-schema.${normalizeCodeKey(kind)}.${normalizeCodeKey(readinessOutcome)}`;
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

function normalizeCodeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "");
}

