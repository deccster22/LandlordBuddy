import type { ReviewHandoffState } from "../handoff/reviewState.js";
import type { NoticeReadinessResult } from "../notice-readiness/index.js";
import type { OutputPackageTimelineContent } from "./timelineAdapter.js";
import type {
  StructuralTrustBinding,
  StructuralTrustSurfaceBinding,
  VisibleSourceTypeLabelBinding
} from "./trustBindings.js";

type RendererStateTrustBinding = Pick<
  StructuralTrustBinding,
  | "kind"
  | "schemaKey"
  | "boundaryStatementKeys"
  | "boundaryStatementKeysByCode"
  | "reviewStateKeys"
  | "trustCueKeys"
  | "visibleSourceTypeLabels"
  | "surfaceBindings"
>;

export interface RendererStateInput {
  noticeReadiness?: NoticeReadinessResult;
  timelineContent?: OutputPackageTimelineContent;
  reviewHandoffState: ReviewHandoffState;
  trustBinding: RendererStateTrustBinding;
}

export interface RendererState {
  primaryState: ReviewHandoffState["readiness"]["outcome"];
  surface: {
    kind: RendererStateTrustBinding["kind"];
    schemaKey: string;
    surfaceKeys: string[];
  };
  readiness: {
    outcome: ReviewHandoffState["readiness"]["outcome"];
    reviewRequirement: ReviewHandoffState["readiness"]["reviewRequirement"];
    evaluated: boolean;
    readyForProgression: boolean;
    summary: NoticeReadinessResult["summary"] | null;
  };
  sequencing: {
    posture: ReviewHandoffState["sequencing"]["posture"];
    blocked: boolean;
    guarded: boolean;
    external: boolean;
    dependencyHolds: boolean;
    reviewCueKeys: string[];
  };
  handoff: {
    posture: ReviewHandoffState["handoff"]["posture"];
    reviewBeforeOfficialStep: ReviewHandoffState["handoff"]["reviewBeforeOfficialStep"];
    officialStep: ReviewHandoffState["handoff"]["officialStep"];
    productExecution: ReviewHandoffState["handoff"]["productExecution"];
  };
  ownership: {
    productPreparation: {
      role: "PRODUCT_PREPARATION";
      owner: ReviewHandoffState["ownership"]["productPreparation"]["owner"];
      boundary: ReviewHandoffState["ownership"]["productPreparation"]["boundary"];
      status: ReviewHandoffState["ownership"]["productPreparation"]["status"];
    };
    nextAction: {
      role: "USER_OR_OPERATOR_ACTION";
      owner: ReviewHandoffState["ownership"]["nextAction"]["owner"];
      boundary: ReviewHandoffState["ownership"]["nextAction"]["boundary"];
      kind: ReviewHandoffState["ownership"]["nextAction"]["kind"];
      officialDependency: ReviewHandoffState["ownership"]["nextAction"]["officialDependency"];
      requiresHumanReview: boolean;
      requiresGuardedReview: boolean;
      requiresBlockerResolution: boolean;
      referOut: boolean;
    };
    officialExecution: {
      role: "EXTERNAL_OFFICIAL_SYSTEM";
      visible: boolean;
      required: boolean;
      state: ReviewHandoffState["handoff"]["officialStep"];
      dependency: ReviewHandoffState["ownership"]["nextAction"]["officialDependency"];
      productExecution: ReviewHandoffState["handoff"]["productExecution"];
    };
  };
  progression: {
    readinessPending: boolean;
    blockedByReadiness: boolean;
    blockedBySequencing: boolean;
    humanReviewRequired: boolean;
    guardedReviewRequiredBeforeOfficialStep: boolean;
    referredOut: boolean;
  };
  trust: {
    showGuardedWarning: boolean;
    showExternalStep: boolean;
    showDependencyHold: boolean;
    showBlockedState: boolean;
    boundaryStatementKeys: string[];
    boundaryStatementKeysByCode: Record<string, string>;
    reviewStateKeys: string[];
    trustCueKeys: string[];
    visibleSourceTypeLabels: VisibleSourceTypeLabelBinding[];
    surfaceBindings: StructuralTrustSurfaceBinding[];
  };
}

const humanReviewActionKinds = new Set<
  ReviewHandoffState["ownership"]["nextAction"]["kind"]
>([
  "ATTACH_REVIEW_STATE",
  "COMPLETE_LOCAL_REVIEW"
]);

const guardedReviewActionKinds = new Set<
  ReviewHandoffState["ownership"]["nextAction"]["kind"]
>([
  "COMPLETE_GUARDED_REVIEW"
]);

const blockedReviewStateKeys = new Set([
  "review-state.blocked",
  "review-state.sequencing-blocked"
]);

const guardedReviewStateKeys = new Set([
  "review-state.guarded-items-visible",
  "review-state.sequencing-guarded",
  "review-state.slowdown-review-required"
]);

export function deriveRendererState(
  input: RendererStateInput
): RendererState {
  const { reviewHandoffState } = input;
  const nextAction = reviewHandoffState.ownership.nextAction;
  const officialExecutionVisible = reviewHandoffState.sequencing.externalOfficialDependencyVisible
    || reviewHandoffState.handoff.officialStep === "EXTERNAL_DEPENDENCY_PENDING";
  const officialExecutionRequired = nextAction.officialDependency === "EXTERNAL_OFFICIAL_STEP";
  const readinessPending = reviewHandoffState.readiness.outcome === "NOT_EVALUATED";
  const blockedByReadiness = reviewHandoffState.readiness.outcome === "BLOCKED";
  const blockedBySequencing = reviewHandoffState.sequencing.blockedUpstream;
  const humanReviewRequired = reviewHandoffState.readiness.reviewRequirement
    === "HUMAN_REVIEW_REQUIRED";
  const guardedReviewRequiredBeforeOfficialStep =
    reviewHandoffState.handoff.reviewBeforeOfficialStep === "GUARDED_REVIEW_REQUIRED";
  const referredOut = reviewHandoffState.readiness.outcome === "REFER_OUT";

  return {
    primaryState: reviewHandoffState.readiness.outcome,
    surface: {
      kind: input.trustBinding.kind,
      schemaKey: input.trustBinding.schemaKey,
      surfaceKeys: input.trustBinding.surfaceBindings.map((binding) => binding.surfaceKey)
    },
    readiness: {
      outcome: reviewHandoffState.readiness.outcome,
      reviewRequirement: reviewHandoffState.readiness.reviewRequirement,
      evaluated: !readinessPending,
      readyForProgression: input.noticeReadiness?.readyForProgression
        ?? reviewHandoffState.readiness.outcome === "READY_FOR_REVIEW",
      summary: input.noticeReadiness?.summary ?? null
    },
    sequencing: {
      posture: reviewHandoffState.sequencing.posture,
      blocked: reviewHandoffState.sequencing.blockedUpstream,
      guarded: reviewHandoffState.sequencing.guardedReviewVisible,
      external: reviewHandoffState.sequencing.externalOfficialDependencyVisible,
      dependencyHolds: reviewHandoffState.sequencing.dependencyHoldPointsVisible,
      reviewCueKeys: [...(input.timelineContent?.reviewCueKeys ?? [])]
    },
    handoff: {
      posture: reviewHandoffState.handoff.posture,
      reviewBeforeOfficialStep: reviewHandoffState.handoff.reviewBeforeOfficialStep,
      officialStep: reviewHandoffState.handoff.officialStep,
      productExecution: reviewHandoffState.handoff.productExecution
    },
    ownership: {
      productPreparation: {
        role: "PRODUCT_PREPARATION",
        owner: reviewHandoffState.ownership.productPreparation.owner,
        boundary: reviewHandoffState.ownership.productPreparation.boundary,
        status: reviewHandoffState.ownership.productPreparation.status
      },
      nextAction: {
        role: "USER_OR_OPERATOR_ACTION",
        owner: nextAction.owner,
        boundary: nextAction.boundary,
        kind: nextAction.kind,
        officialDependency: nextAction.officialDependency,
        requiresHumanReview: humanReviewActionKinds.has(nextAction.kind),
        requiresGuardedReview: guardedReviewActionKinds.has(nextAction.kind),
        requiresBlockerResolution: nextAction.kind === "RESOLVE_BLOCKER",
        referOut: nextAction.kind === "REFER_OUTSIDE_STANDARD_PATH"
      },
      officialExecution: {
        role: "EXTERNAL_OFFICIAL_SYSTEM",
        visible: officialExecutionVisible,
        required: officialExecutionRequired,
        state: reviewHandoffState.handoff.officialStep,
        dependency: nextAction.officialDependency,
        productExecution: reviewHandoffState.handoff.productExecution
      }
    },
    progression: {
      readinessPending,
      blockedByReadiness,
      blockedBySequencing,
      humanReviewRequired,
      guardedReviewRequiredBeforeOfficialStep,
      referredOut
    },
    trust: {
      showGuardedWarning: guardedReviewRequiredBeforeOfficialStep
        || reviewHandoffState.sequencing.guardedReviewVisible
        || hasAnyKey(input.trustBinding.reviewStateKeys, guardedReviewStateKeys),
      showExternalStep: officialExecutionVisible
        || input.trustBinding.reviewStateKeys.includes("review-state.official-step-external"),
      showDependencyHold: reviewHandoffState.sequencing.dependencyHoldPointsVisible
        || input.timelineContent?.showDependencyHoldPoints === true,
      showBlockedState: blockedByReadiness
        || blockedBySequencing
        || hasAnyKey(input.trustBinding.reviewStateKeys, blockedReviewStateKeys),
      boundaryStatementKeys: [...input.trustBinding.boundaryStatementKeys],
      boundaryStatementKeysByCode: { ...input.trustBinding.boundaryStatementKeysByCode },
      reviewStateKeys: [...input.trustBinding.reviewStateKeys],
      trustCueKeys: [...input.trustBinding.trustCueKeys],
      visibleSourceTypeLabels: input.trustBinding.visibleSourceTypeLabels.map((label) => ({
        ...label
      })),
      surfaceBindings: input.trustBinding.surfaceBindings.map(cloneSurfaceBinding)
    }
  };
}

function cloneSurfaceBinding(
  binding: StructuralTrustSurfaceBinding
): StructuralTrustSurfaceBinding {
  return {
    ...binding,
    trustSurfaceKeys: [...binding.trustSurfaceKeys],
    boundaryStatementKeys: [...binding.boundaryStatementKeys],
    trustCueKeys: [...binding.trustCueKeys]
  };
}

function hasAnyKey(values: readonly string[], keys: ReadonlySet<string>): boolean {
  return values.some((value) => keys.has(value));
}
