export const forumPaths = [
  "VIC_VCAT_RENT_ARREARS",
  "OTHER_OR_UNRESOLVED"
] as const;

export type ForumPath = (typeof forumPaths)[number];

export const forumPathStatuses = [
  "IN_SCOPE_CONFIRMED",
  "GUARDED_OR_UNRESOLVED"
] as const;

export type ForumPathStatus = (typeof forumPathStatuses)[number];

export interface ForumPathState {
  path: ForumPath;
  lane: "ARREARS_TO_NOTICE_READINESS";
  scope: "VICTORIA_ONLY";
  status: ForumPathStatus;
  guardedReason?: string;
}

export const outputModes = [
  "PRINTABLE_OUTPUT",
  "PREP_PACK_COPY_READY",
  "OFFICIAL_HANDOFF_GUIDANCE"
] as const;

export type OutputMode = (typeof outputModes)[number];

export interface OutputModeState {
  mode: OutputMode;
  surface: "PRINTABLE" | "COPY_READY" | "GUIDANCE_ONLY";
  reviewState: "HUMAN_REVIEW_REQUIRED";
  productBoundary: "NO_OFFICIAL_SUBMISSION";
}

export const officialHandoffStates = [
  "NOT_STARTED",
  "PREPARING_HANDOFF",
  "READY_TO_HAND_OFF",
  "HANDED_OFF",
  "EXTERNAL_ACTION_PENDING"
] as const;

export type OfficialHandoffState = (typeof officialHandoffStates)[number];

export interface OfficialHandoffStateRecord {
  stage: OfficialHandoffState;
  handoffChannel: "USER_OR_OPERATOR";
  authenticatedTouchpoint: "NOT_EXPECTED" | "MAY_BE_REQUIRED" | "REQUIRED";
  productBoundary: "PREP_AND_HANDOFF_ONLY";
}

export interface PreparationSeparationState {
  forumPath: ForumPathState;
  outputMode: OutputModeState;
  officialHandoff: OfficialHandoffStateRecord;
}

const outputSurfaceByMode: Record<OutputMode, OutputModeState["surface"]> = {
  PRINTABLE_OUTPUT: "PRINTABLE",
  PREP_PACK_COPY_READY: "COPY_READY",
  OFFICIAL_HANDOFF_GUIDANCE: "GUIDANCE_ONLY"
};

const authenticatedTouchpointByStage: Record<
  OfficialHandoffState,
  OfficialHandoffStateRecord["authenticatedTouchpoint"]
> = {
  NOT_STARTED: "NOT_EXPECTED",
  PREPARING_HANDOFF: "MAY_BE_REQUIRED",
  READY_TO_HAND_OFF: "MAY_BE_REQUIRED",
  HANDED_OFF: "REQUIRED",
  EXTERNAL_ACTION_PENDING: "REQUIRED"
};

export function createForumPathState(input: {
  path: ForumPath;
  status?: ForumPathStatus;
  guardedReason?: string;
}): ForumPathState {
  const status = input.status
    ?? (input.path === "VIC_VCAT_RENT_ARREARS"
      ? "IN_SCOPE_CONFIRMED"
      : "GUARDED_OR_UNRESOLVED");

  return {
    path: input.path,
    lane: "ARREARS_TO_NOTICE_READINESS",
    scope: "VICTORIA_ONLY",
    status,
    ...(input.guardedReason ? { guardedReason: input.guardedReason } : {})
  };
}

export function createOutputModeState(mode: OutputMode): OutputModeState {
  return {
    mode,
    surface: outputSurfaceByMode[mode],
    reviewState: "HUMAN_REVIEW_REQUIRED",
    productBoundary: "NO_OFFICIAL_SUBMISSION"
  };
}

export function createOfficialHandoffStateRecord(
  stage: OfficialHandoffState
): OfficialHandoffStateRecord {
  return {
    stage,
    handoffChannel: "USER_OR_OPERATOR",
    authenticatedTouchpoint: authenticatedTouchpointByStage[stage],
    productBoundary: "PREP_AND_HANDOFF_ONLY"
  };
}

export function validatePreparationSeparation(
  state: PreparationSeparationState
): string[] {
  const issues: string[] = [];

  if (!forumPaths.includes(state.forumPath.path)) {
    issues.push("Matter forumPath.path must be one of the supported forum paths.");
  }

  if (state.forumPath.lane !== "ARREARS_TO_NOTICE_READINESS") {
    issues.push("Matter forumPath.lane must stay in the arrears-to-notice-readiness lane.");
  }

  if (state.forumPath.scope !== "VICTORIA_ONLY") {
    issues.push("Matter forumPath.scope must stay Victoria-only for this MVP lane.");
  }

  if (
    state.forumPath.path === "OTHER_OR_UNRESOLVED"
    && state.forumPath.status === "IN_SCOPE_CONFIRMED"
  ) {
    issues.push("Unresolved forum paths cannot be marked in-scope confirmed.");
  }

  if (!outputModes.includes(state.outputMode.mode)) {
    issues.push("Matter outputMode.mode must be one of the supported output modes.");
  }

  if (state.outputMode.productBoundary !== "NO_OFFICIAL_SUBMISSION") {
    issues.push("Matter outputMode must not imply official submission.");
  }

  if (!officialHandoffStates.includes(state.officialHandoff.stage)) {
    issues.push("Matter officialHandoff.stage must be one of the supported handoff states.");
  }

  if (state.officialHandoff.handoffChannel !== "USER_OR_OPERATOR") {
    issues.push("Matter officialHandoff.handoffChannel must stay outside product execution.");
  }

  if (state.officialHandoff.productBoundary !== "PREP_AND_HANDOFF_ONLY") {
    issues.push("Matter officialHandoff must preserve the prep-and-handoff boundary.");
  }

  if (
    state.officialHandoff.authenticatedTouchpoint
    !== authenticatedTouchpointByStage[state.officialHandoff.stage]
  ) {
    issues.push("Matter officialHandoff.authenticatedTouchpoint must match the handoff stage.");
  }

  return issues;
}
