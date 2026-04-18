import type { OfficialHandoffStateRecord } from "../../domain/preparation.js";

export const reviewHandoffReadinessOutcomes = [
  "NOT_EVALUATED",
  "READY_FOR_REVIEW",
  "BLOCKED",
  "REVIEW_REQUIRED",
  "REFER_OUT"
] as const;

export type ReviewHandoffReadinessOutcome =
  (typeof reviewHandoffReadinessOutcomes)[number];

export const reviewHandoffReviewRequirements = [
  "READINESS_BINDING_PENDING",
  "HUMAN_REVIEW_REQUIRED",
  "GUARDED_REVIEW_REQUIRED",
  "BLOCKED",
  "REFERRAL_STOP"
] as const;

export type ReviewHandoffReviewRequirement =
  (typeof reviewHandoffReviewRequirements)[number];

export const reviewHandoffSequencingPostures = [
  "NOT_INCLUDED",
  "VISIBLE_NO_HOLD",
  "BLOCKED_UPSTREAM",
  "GUARDED_REVIEW_VISIBLE",
  "EXTERNAL_OFFICIAL_DEPENDENCY_VISIBLE",
  "GUARDED_AND_EXTERNAL_VISIBLE"
] as const;

export type ReviewHandoffSequencingPosture =
  (typeof reviewHandoffSequencingPostures)[number];

export const reviewHandoffPostures = [
  "INTERNAL_PREPARATION_ACTIVE",
  "BLOCKED_UPSTREAM",
  "GUARDED_REVIEW_REQUIRED",
  "REFERRAL_STOP",
  "EXTERNAL_NEXT_ACTION_PENDING"
] as const;

export type ReviewHandoffPosture = (typeof reviewHandoffPostures)[number];

export const reviewHandoffOfficialStepStates = [
  "NOT_INCLUDED",
  "EXTERNAL_DEPENDENCY_PENDING"
] as const;

export type ReviewHandoffOfficialStepState =
  (typeof reviewHandoffOfficialStepStates)[number];

export const reviewHandoffActionBoundaries = [
  "INSIDE_LANDLORD_BUDDY",
  "OUTSIDE_LANDLORD_BUDDY"
] as const;

export type ReviewHandoffActionBoundary =
  (typeof reviewHandoffActionBoundaries)[number];

export const reviewHandoffProductPreparationStatuses = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "READY_TO_HAND_OFF",
  "COMPLETE_FOR_EXTERNAL_HANDOFF",
  "BLOCKED",
  "STOPPED_REFER_OUT"
] as const;

export type ReviewHandoffProductPreparationStatus =
  (typeof reviewHandoffProductPreparationStatuses)[number];

export const reviewHandoffNextActionKinds = [
  "ATTACH_REVIEW_STATE",
  "RESOLVE_BLOCKER",
  "COMPLETE_LOCAL_REVIEW",
  "COMPLETE_GUARDED_REVIEW",
  "TAKE_EXTERNAL_OFFICIAL_STEP",
  "REFER_OUTSIDE_STANDARD_PATH"
] as const;

export type ReviewHandoffNextActionKind =
  (typeof reviewHandoffNextActionKinds)[number];

export const reviewHandoffOfficialDependencies = [
  "NONE",
  "EXTERNAL_OFFICIAL_STEP"
] as const;

export type ReviewHandoffOfficialDependency =
  (typeof reviewHandoffOfficialDependencies)[number];

export interface ReviewHandoffState {
  readiness: {
    outcome: ReviewHandoffReadinessOutcome;
    reviewRequirement: ReviewHandoffReviewRequirement;
  };
  sequencing: {
    posture: ReviewHandoffSequencingPosture;
    blockedUpstream: boolean;
    guardedReviewVisible: boolean;
    externalOfficialDependencyVisible: boolean;
    dependencyHoldPointsVisible: boolean;
  };
  handoff: {
    posture: ReviewHandoffPosture;
    reviewBeforeOfficialStep: ReviewHandoffReviewRequirement;
    officialStep: ReviewHandoffOfficialStepState;
    productExecution: "NOT_EXECUTED_BY_PRODUCT";
  };
  ownership: {
    productPreparation: {
      owner: "LANDLORD_BUDDY";
      boundary: ReviewHandoffActionBoundary;
      status: ReviewHandoffProductPreparationStatus;
    };
    nextAction: {
      owner: "USER_OR_OPERATOR";
      boundary: ReviewHandoffActionBoundary;
      kind: ReviewHandoffNextActionKind;
      officialDependency: ReviewHandoffOfficialDependency;
    };
  };
}

export interface ReviewHandoffStateInput {
  readinessOutcome: ReviewHandoffReadinessOutcome;
  officialHandoff: OfficialHandoffStateRecord;
  surfaceKeys: readonly string[];
}

const externalNextActionStages = new Set<OfficialHandoffStateRecord["stage"]>([
  "READY_TO_HAND_OFF",
  "HANDED_OFF",
  "EXTERNAL_ACTION_PENDING"
]);

export function deriveReviewHandoffState(
  input: ReviewHandoffStateInput
): ReviewHandoffState {
  const sequencing = deriveSequencingState(input.surfaceKeys);
  const readinessReviewRequirement = mapReadinessReviewRequirement(
    input.readinessOutcome
  );
  const referralStop = input.readinessOutcome === "REFER_OUT"
    || input.surfaceKeys.includes("referral-stop");
  const blockedUpstream = input.readinessOutcome === "BLOCKED"
    || sequencing.blockedUpstream;
  const guardedReviewRequired = input.readinessOutcome === "REVIEW_REQUIRED"
    || sequencing.guardedReviewVisible;
  const externalNextActionPending = !referralStop
    && !blockedUpstream
    && !guardedReviewRequired
    && input.readinessOutcome !== "NOT_EVALUATED"
    && externalNextActionStages.has(input.officialHandoff.stage);
  const reviewBeforeOfficialStep = resolveReviewBeforeOfficialStep({
    readinessOutcome: input.readinessOutcome,
    referralStop,
    blockedUpstream,
    guardedReviewRequired
  });

  return {
    readiness: {
      outcome: input.readinessOutcome,
      reviewRequirement: readinessReviewRequirement
    },
    sequencing,
    handoff: {
      posture: resolveHandoffPosture({
        referralStop,
        blockedUpstream,
        guardedReviewRequired,
        externalNextActionPending
      }),
      reviewBeforeOfficialStep,
      officialStep: externalNextActionPending
        ? "EXTERNAL_DEPENDENCY_PENDING"
        : "NOT_INCLUDED",
      productExecution: "NOT_EXECUTED_BY_PRODUCT"
    },
    ownership: {
      productPreparation: {
        owner: "LANDLORD_BUDDY",
        boundary: "INSIDE_LANDLORD_BUDDY",
        status: resolveProductPreparationStatus({
          readinessOutcome: input.readinessOutcome,
          officialHandoff: input.officialHandoff,
          referralStop,
          blockedUpstream,
          guardedReviewRequired
        })
      },
      nextAction: resolveNextAction({
        readinessOutcome: input.readinessOutcome,
        referralStop,
        blockedUpstream,
        guardedReviewRequired,
        externalNextActionPending
      })
    }
  };
}

function deriveSequencingState(
  surfaceKeys: readonly string[]
): ReviewHandoffState["sequencing"] {
  const blockedUpstream = surfaceKeys.includes("sequencing-blocked");
  const guardedReviewVisible = surfaceKeys.includes("sequencing-guarded")
    || surfaceKeys.includes("live-confirmation-required");
  const externalOfficialDependencyVisible = surfaceKeys.includes("external-step-summary");
  const dependencyHoldPointsVisible = surfaceKeys.includes("dependency-hold-points");

  return {
    posture: resolveSequencingPosture({
      blockedUpstream,
      guardedReviewVisible,
      externalOfficialDependencyVisible,
      dependencyHoldPointsVisible
    }),
    blockedUpstream,
    guardedReviewVisible,
    externalOfficialDependencyVisible,
    dependencyHoldPointsVisible
  };
}

function mapReadinessReviewRequirement(
  readinessOutcome: ReviewHandoffReadinessOutcome
): ReviewHandoffReviewRequirement {
  switch (readinessOutcome) {
    case "NOT_EVALUATED":
      return "READINESS_BINDING_PENDING";
    case "READY_FOR_REVIEW":
      return "HUMAN_REVIEW_REQUIRED";
    case "BLOCKED":
      return "BLOCKED";
    case "REVIEW_REQUIRED":
      return "GUARDED_REVIEW_REQUIRED";
    case "REFER_OUT":
      return "REFERRAL_STOP";
  }
}

function resolveSequencingPosture(input: {
  blockedUpstream: boolean;
  guardedReviewVisible: boolean;
  externalOfficialDependencyVisible: boolean;
  dependencyHoldPointsVisible: boolean;
}): ReviewHandoffSequencingPosture {
  if (
    !input.blockedUpstream
    && !input.guardedReviewVisible
    && !input.externalOfficialDependencyVisible
    && !input.dependencyHoldPointsVisible
  ) {
    return "NOT_INCLUDED";
  }

  if (input.blockedUpstream) {
    return "BLOCKED_UPSTREAM";
  }

  if (
    input.guardedReviewVisible
    && input.externalOfficialDependencyVisible
  ) {
    return "GUARDED_AND_EXTERNAL_VISIBLE";
  }

  if (input.guardedReviewVisible) {
    return "GUARDED_REVIEW_VISIBLE";
  }

  if (input.externalOfficialDependencyVisible) {
    return "EXTERNAL_OFFICIAL_DEPENDENCY_VISIBLE";
  }

  return "VISIBLE_NO_HOLD";
}

function resolveReviewBeforeOfficialStep(input: {
  readinessOutcome: ReviewHandoffReadinessOutcome;
  referralStop: boolean;
  blockedUpstream: boolean;
  guardedReviewRequired: boolean;
}): ReviewHandoffReviewRequirement {
  if (input.referralStop) {
    return "REFERRAL_STOP";
  }

  if (input.blockedUpstream) {
    return "BLOCKED";
  }

  if (input.guardedReviewRequired) {
    return "GUARDED_REVIEW_REQUIRED";
  }

  return mapReadinessReviewRequirement(input.readinessOutcome);
}

function resolveHandoffPosture(input: {
  referralStop: boolean;
  blockedUpstream: boolean;
  guardedReviewRequired: boolean;
  externalNextActionPending: boolean;
}): ReviewHandoffPosture {
  if (input.referralStop) {
    return "REFERRAL_STOP";
  }

  if (input.blockedUpstream) {
    return "BLOCKED_UPSTREAM";
  }

  if (input.guardedReviewRequired) {
    return "GUARDED_REVIEW_REQUIRED";
  }

  if (input.externalNextActionPending) {
    return "EXTERNAL_NEXT_ACTION_PENDING";
  }

  return "INTERNAL_PREPARATION_ACTIVE";
}

function resolveProductPreparationStatus(input: {
  readinessOutcome: ReviewHandoffReadinessOutcome;
  officialHandoff: OfficialHandoffStateRecord;
  referralStop: boolean;
  blockedUpstream: boolean;
  guardedReviewRequired: boolean;
}): ReviewHandoffProductPreparationStatus {
  if (input.referralStop) {
    return "STOPPED_REFER_OUT";
  }

  if (input.blockedUpstream) {
    return "BLOCKED";
  }

  if (
    input.guardedReviewRequired
    || input.readinessOutcome === "NOT_EVALUATED"
  ) {
    return "IN_PROGRESS";
  }

  switch (input.officialHandoff.stage) {
    case "NOT_STARTED":
      return "NOT_STARTED";
    case "PREPARING_HANDOFF":
      return "IN_PROGRESS";
    case "READY_TO_HAND_OFF":
      return "READY_TO_HAND_OFF";
    case "HANDED_OFF":
    case "EXTERNAL_ACTION_PENDING":
      return "COMPLETE_FOR_EXTERNAL_HANDOFF";
  }
}

function resolveNextAction(input: {
  readinessOutcome: ReviewHandoffReadinessOutcome;
  referralStop: boolean;
  blockedUpstream: boolean;
  guardedReviewRequired: boolean;
  externalNextActionPending: boolean;
}): ReviewHandoffState["ownership"]["nextAction"] {
  if (input.referralStop) {
    return {
      owner: "USER_OR_OPERATOR",
      boundary: "OUTSIDE_LANDLORD_BUDDY",
      kind: "REFER_OUTSIDE_STANDARD_PATH",
      officialDependency: "NONE"
    };
  }

  if (input.blockedUpstream) {
    return {
      owner: "USER_OR_OPERATOR",
      boundary: "INSIDE_LANDLORD_BUDDY",
      kind: "RESOLVE_BLOCKER",
      officialDependency: "NONE"
    };
  }

  if (input.guardedReviewRequired) {
    return {
      owner: "USER_OR_OPERATOR",
      boundary: "INSIDE_LANDLORD_BUDDY",
      kind: "COMPLETE_GUARDED_REVIEW",
      officialDependency: "NONE"
    };
  }

  if (input.readinessOutcome === "NOT_EVALUATED") {
    return {
      owner: "USER_OR_OPERATOR",
      boundary: "INSIDE_LANDLORD_BUDDY",
      kind: "ATTACH_REVIEW_STATE",
      officialDependency: "NONE"
    };
  }

  if (input.externalNextActionPending) {
    return {
      owner: "USER_OR_OPERATOR",
      boundary: "OUTSIDE_LANDLORD_BUDDY",
      kind: "TAKE_EXTERNAL_OFFICIAL_STEP",
      officialDependency: "EXTERNAL_OFFICIAL_STEP"
    };
  }

  return {
    owner: "USER_OR_OPERATOR",
    boundary: "INSIDE_LANDLORD_BUDDY",
    kind: "COMPLETE_LOCAL_REVIEW",
    officialDependency: "NONE"
  };
}
