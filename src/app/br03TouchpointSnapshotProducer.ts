import type {
  DateTimeString,
  EntityId
} from "../domain/model.js";
import type {
  ForumPath,
  ForumPathState
} from "../domain/preparation.js";
import {
  createTouchpointPostureSnapshot,
  listTouchpointsForForumPath,
  lookupTouchpointMetadata,
  type TouchpointChannelPosture,
  type TouchpointFreshnessPosture,
  type TouchpointMetadata,
  type TouchpointPostureSnapshot
} from "../modules/touchpoints/index.js";

export const br03TouchpointSourceEventKinds = [
  "OUTPUT_REVIEW_CHECKPOINT",
  "OFFICIAL_HANDOFF_CHECKPOINT",
  "CHANNEL_CONTEXT_NOTE",
  "FRESHNESS_CHECK_NOTE",
  "AUTHENTICATED_SURFACE_NOTE",
  "MANUAL_REVIEW_NOTE"
] as const;

export type Br03TouchpointSourceEventKind =
  (typeof br03TouchpointSourceEventKinds)[number];

export const br03TouchpointFreshnessSignals = [
  "CURRENT",
  "STALE"
] as const;

export type Br03TouchpointFreshnessSignal =
  (typeof br03TouchpointFreshnessSignals)[number];

export interface Br03TouchpointPostureSourceEvent {
  touchpointId: string;
  sourceEventId: EntityId;
  sourceKind: Br03TouchpointSourceEventKind;
  capturedAt: DateTimeString;
  observedAt?: DateTimeString;
  provenanceReferenceId?: EntityId;
  observedChannelOrPath?: string;
  expectedChannelOrPath?: string;
  freshnessSignal?: Br03TouchpointFreshnessSignal;
  liveConfirmationRequiredSignal?: boolean;
  wrongChannelSignal?: boolean;
  authenticatedHandoffOnlySignal?: boolean;
  reason?: string;
  notes?: readonly string[];
}

export interface BuildBr03TouchpointPostureSnapshotsInput {
  forumPath: ForumPath | ForumPathState;
  touchpointIds?: readonly string[];
  sourceEvents?: readonly Br03TouchpointPostureSourceEvent[];
}

export interface Br03TouchpointSnapshotProductionResult {
  snapshots: TouchpointPostureSnapshot[];
  appliedSourceEventIds: string[];
  ignoredSourceEventIds: string[];
  registryDefaultTouchpointIds: string[];
}

export function buildBr03TouchpointPostureSnapshots(
  input: BuildBr03TouchpointPostureSnapshotsInput
): Br03TouchpointSnapshotProductionResult {
  const forumPath = normalizeForumPath(input.forumPath);
  const touchpoints = resolveTouchpoints(forumPath, input.touchpointIds);
  const selectedTouchpointIds = new Set(touchpoints.map((touchpoint) => touchpoint.id));
  const sourceEventsByTouchpointId = new Map<string, Br03TouchpointPostureSourceEvent[]>();
  const ignoredSourceEventIds: string[] = [];

  for (const sourceEvent of input.sourceEvents ?? []) {
    const metadata = lookupTouchpointMetadata(sourceEvent.touchpointId);

    if (!metadata || metadata.forumPath !== forumPath) {
      ignoredSourceEventIds.push(sourceEvent.sourceEventId);
      continue;
    }

    if (!selectedTouchpointIds.has(sourceEvent.touchpointId)) {
      ignoredSourceEventIds.push(sourceEvent.sourceEventId);
      continue;
    }

    const existingEvents = sourceEventsByTouchpointId.get(sourceEvent.touchpointId) ?? [];
    existingEvents.push(sourceEvent);
    sourceEventsByTouchpointId.set(sourceEvent.touchpointId, existingEvents);
  }

  const snapshots: TouchpointPostureSnapshot[] = [];
  const appliedSourceEventIds: string[] = [];
  const registryDefaultTouchpointIds: string[] = [];

  for (const touchpoint of touchpoints) {
    const sourceEvent = selectLatestSourceEvent(
      sourceEventsByTouchpointId.get(touchpoint.id) ?? []
    );

    if (!sourceEvent) {
      snapshots.push(createTouchpointPostureSnapshot({
        touchpointId: touchpoint.id,
        source: "TOUCHPOINT_REGISTRY_DEFAULT",
        summary: [
          "No persisted touchpoint source event found.",
          "Registry-default posture snapshot is retained and does not assert live official parity."
        ].join(" ")
      }));
      registryDefaultTouchpointIds.push(touchpoint.id);
      continue;
    }

    const freshnessPosture = deriveFreshnessPosture(sourceEvent);
    const channelPosture = deriveChannelPosture(sourceEvent);
    const authenticatedHandoffOnly = deriveAuthenticatedHandoffOnly(
      touchpoint,
      sourceEvent
    );

    snapshots.push(createTouchpointPostureSnapshot({
      touchpointId: touchpoint.id,
      ...(freshnessPosture !== undefined
        ? { freshnessPosture }
        : {}),
      ...(channelPosture !== undefined
        ? { channelPosture }
        : {}),
      ...(authenticatedHandoffOnly !== undefined
        ? { authenticatedHandoffOnly }
        : {}),
      source: "TOUCHPOINT_SOURCE_FEED",
      summary: buildSourceEventSummary(sourceEvent)
    }));
    appliedSourceEventIds.push(sourceEvent.sourceEventId);
  }

  return {
    snapshots,
    appliedSourceEventIds,
    ignoredSourceEventIds,
    registryDefaultTouchpointIds
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

function normalizeForumPath(forumPath: ForumPath | ForumPathState): ForumPath {
  if (typeof forumPath === "string") {
    return forumPath;
  }

  return forumPath.path;
}

function selectLatestSourceEvent(
  sourceEvents: readonly Br03TouchpointPostureSourceEvent[]
): Br03TouchpointPostureSourceEvent | undefined {
  if (sourceEvents.length === 0) {
    return undefined;
  }

  const [latestSourceEvent] = [...sourceEvents].sort((left, right) => (
    compareEventTimestamps(right, left)
  ));

  return latestSourceEvent;
}

function compareEventTimestamps(
  left: Br03TouchpointPostureSourceEvent,
  right: Br03TouchpointPostureSourceEvent
): number {
  const leftObserved = Date.parse(left.observedAt ?? left.capturedAt);
  const rightObserved = Date.parse(right.observedAt ?? right.capturedAt);

  if (Number.isFinite(leftObserved) && Number.isFinite(rightObserved)) {
    if (leftObserved !== rightObserved) {
      return leftObserved - rightObserved;
    }
  } else if (leftObserved !== rightObserved) {
    const leftComparable = left.observedAt ?? left.capturedAt;
    const rightComparable = right.observedAt ?? right.capturedAt;
    return leftComparable.localeCompare(rightComparable);
  }

  const leftCaptured = Date.parse(left.capturedAt);
  const rightCaptured = Date.parse(right.capturedAt);

  if (Number.isFinite(leftCaptured) && Number.isFinite(rightCaptured)) {
    if (leftCaptured !== rightCaptured) {
      return leftCaptured - rightCaptured;
    }
  } else if (left.capturedAt !== right.capturedAt) {
    return left.capturedAt.localeCompare(right.capturedAt);
  }

  return left.sourceEventId.localeCompare(right.sourceEventId);
}

function deriveFreshnessPosture(
  sourceEvent: Br03TouchpointPostureSourceEvent
): TouchpointFreshnessPosture | undefined {
  if (sourceEvent.liveConfirmationRequiredSignal === true) {
    return "LIVE_CONFIRMATION_REQUIRED";
  }

  if (sourceEvent.freshnessSignal === "STALE") {
    return "STALE";
  }

  if (sourceEvent.freshnessSignal === "CURRENT") {
    return "CURRENT";
  }

  return undefined;
}

function deriveChannelPosture(
  sourceEvent: Br03TouchpointPostureSourceEvent
): TouchpointChannelPosture | undefined {
  if (sourceEvent.wrongChannelSignal === true) {
    return "WRONG_CHANNEL_REROUTE";
  }

  if (sourceEvent.wrongChannelSignal === false) {
    return "IN_SCOPE_CHANNEL";
  }

  return undefined;
}

function deriveAuthenticatedHandoffOnly(
  touchpoint: TouchpointMetadata,
  sourceEvent: Br03TouchpointPostureSourceEvent
): boolean | undefined {
  if (touchpoint.area === "AUTHENTICATED_SURFACE") {
    return true;
  }

  if (sourceEvent.authenticatedHandoffOnlySignal === undefined) {
    return undefined;
  }

  return sourceEvent.authenticatedHandoffOnlySignal;
}

function buildSourceEventSummary(
  sourceEvent: Br03TouchpointPostureSourceEvent
): string {
  const summaryParts = [
    `source event ${sourceEvent.sourceEventId}`,
    `kind ${sourceEvent.sourceKind}`,
    `captured ${sourceEvent.capturedAt}`
  ];

  if (sourceEvent.observedAt) {
    summaryParts.push(`observed ${sourceEvent.observedAt}`);
  }

  if (sourceEvent.provenanceReferenceId) {
    summaryParts.push(`provenance ${sourceEvent.provenanceReferenceId}`);
  }

  if (sourceEvent.observedChannelOrPath || sourceEvent.expectedChannelOrPath) {
    summaryParts.push(
      `channel/path observed ${sourceEvent.observedChannelOrPath ?? "unspecified"}`
      + ` expected ${sourceEvent.expectedChannelOrPath ?? "unspecified"}`
    );
  }

  if (sourceEvent.reason) {
    summaryParts.push(`reason ${sourceEvent.reason}`);
  }

  if (sourceEvent.notes && sourceEvent.notes.length > 0) {
    summaryParts.push(`notes ${sourceEvent.notes.join(" | ")}`);
  }

  return `Source-fed posture snapshot from ${summaryParts.join("; ")}.`;
}
