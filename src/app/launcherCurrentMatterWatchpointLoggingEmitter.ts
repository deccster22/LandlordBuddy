import type { Br04LifecycleRouteKind } from "../modules/br04/index.js";
import {
  consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint,
  type LauncherCurrentMatterInternalHandlingAction
} from "./launcherCurrentMatterHandlingActionConsumer.js";
import type {
  HydrateOutputCheckpointInput
} from "./outputHandoffCheckpointHydration.js";
import type {
  LauncherCurrentMatterNonLifecycleTransitionInput
} from "./launcherCurrentMatterTransitionOrchestrationEntry.js";

export const launcherCurrentMatterWatchpointEventFamilies = [
  "WATCH_LIFECYCLE_RESUME_STATE_OBSERVED",
  "WATCH_LIFECYCLE_NO_RECORD_OBSERVED",
  "WATCH_LIFECYCLE_CANNOT_RESUME_OBSERVED",
  "WATCH_LIFECYCLE_NO_ROUTING_SIGNAL_OBSERVED",
  "WATCH_LIFECYCLE_HOLD_RELEASE_STATE_OBSERVED",
  "WATCH_LIFECYCLE_ACTION_ROUTE_OBSERVED",
  "WATCH_LIFECYCLE_NONLIFECYCLE_SEPARATION_OBSERVED"
] as const;

export type LauncherCurrentMatterWatchpointEventFamily =
  (typeof launcherCurrentMatterWatchpointEventFamilies)[number];

export const launcherCurrentMatterWatchpointSourceSeams = [
  "launcherCurrentMatterExecutionRouting",
  "launcherCurrentMatterExecutionCaller",
  "launcherCurrentMatterHandlingActionConsumer"
] as const;

export type LauncherCurrentMatterWatchpointSourceSeam =
  (typeof launcherCurrentMatterWatchpointSourceSeams)[number];

export const launcherCurrentMatterWatchpointLifecycleStateCategories = [
  "LIFECYCLE_CONTEXT_PRESENT",
  "LIFECYCLE_NO_RECORD_NON_CLEARANCE",
  "LIFECYCLE_CANNOT_SAFELY_RESUME",
  "LIFECYCLE_NO_ROUTING_SIGNAL"
] as const;

export type LauncherCurrentMatterWatchpointLifecycleStateCategory =
  (typeof launcherCurrentMatterWatchpointLifecycleStateCategories)[number];

export const launcherCurrentMatterWatchpointRedactionPostures = [
  "MINIMISED_INTERNAL"
] as const;

export type LauncherCurrentMatterWatchpointRedactionPosture =
  (typeof launcherCurrentMatterWatchpointRedactionPostures)[number];

export const launcherCurrentMatterWatchpointRouteKinds = [
  "DELETION_REQUEST",
  "DEIDENTIFICATION_ACTION",
  "NONE"
] as const;

export type LauncherCurrentMatterWatchpointRouteKind =
  (typeof launcherCurrentMatterWatchpointRouteKinds)[number];

export const launcherCurrentMatterWatchpointForbiddenSemanticTokens = [
  "success",
  "cleared",
  "compliant",
  "ready",
  "accepted",
  "filed",
  "approved",
  "valid",
  "legal",
  "complete",
  "safe",
  "final"
] as const;

export interface LauncherCurrentMatterWatchpointProtectedStateFlags {
  cannotSafelyResumeFlag: boolean;
  noRecordFlag: boolean;
  noRoutingSignalFlag: boolean;
  holdAwareFlag: boolean;
  releaseControlledFlag: boolean;
  lifecycleNonLifecycleSeparationFlag: boolean;
  lifecycleRouteKind: LauncherCurrentMatterWatchpointRouteKind;
}

export interface LauncherCurrentMatterWatchpointEvent {
  eventType: LauncherCurrentMatterWatchpointEventFamily;
  eventId: string;
  observedAt: string;
  sourceSeam: LauncherCurrentMatterWatchpointSourceSeam;
  sourceTaskLineage: string[];
  lifecycleStateCategory: LauncherCurrentMatterWatchpointLifecycleStateCategory;
  protectedStateFlags: LauncherCurrentMatterWatchpointProtectedStateFlags;
  clearanceInferred: false;
  redactionPosture: LauncherCurrentMatterWatchpointRedactionPosture;
  matterLocatorRef?: string;
  outputPackageLocatorRef?: string;
  routingOutcomeCode?: string;
  controlOutcomeCode?: string;
  directiveCode?: string;
  handlingActionCode?: string;
  auditProvenanceRef?: string;
}

export interface LauncherCurrentMatterWatchpointEventSink {
  write(event: LauncherCurrentMatterWatchpointEvent): void;
}

export interface EmitLauncherCurrentMatterWatchpointEventsInput {
  sink: LauncherCurrentMatterWatchpointEventSink;
  handlingAction: LauncherCurrentMatterInternalHandlingAction;
  sourceSeam?: LauncherCurrentMatterWatchpointSourceSeam;
  observedAt?: string;
  sourceTaskLineage?: readonly string[];
  matterLocatorRef?: string;
  outputPackageLocatorRef?: string;
  auditProvenanceRef?: string;
}

export interface EmitLauncherCurrentMatterWatchpointEventsFromOutputCheckpointInput {
  sink: LauncherCurrentMatterWatchpointEventSink;
  outputCheckpoint: HydrateOutputCheckpointInput;
  nonLifecycleTransitionInput?: LauncherCurrentMatterNonLifecycleTransitionInput;
  sourceSeam?: LauncherCurrentMatterWatchpointSourceSeam;
  observedAt?: string;
  sourceTaskLineage?: readonly string[];
}

export const defaultLauncherCurrentMatterWatchpointSourceTaskLineage = [
  "P4B-CX-APP-ROUTE-01",
  "P4B-CX-APP-ROUTE-02",
  "P4B-CX-APP-ROUTE-03",
  "P4B-CX-APP-ROUTE-04",
  "P4B-CX-APP-ROUTE-05",
  "P4B-CX-APP-ROUTE-06",
  "P4B-CX-APP-ROUTE-07",
  "P4B-CX-APP-ROUTE-08",
  "P4B-CX-APP-ROUTE-09",
  "P4B-CX-APP-ROUTE-10",
  "P4B-CX-APP-ALIGN-03",
  "P4B-CX-APP-ALIGN-04"
] as const;

export interface InMemoryLauncherCurrentMatterWatchpointEventSink
  extends LauncherCurrentMatterWatchpointEventSink {
  readEvents(): LauncherCurrentMatterWatchpointEvent[];
  clear(): void;
}

export function createInMemoryLauncherCurrentMatterWatchpointEventSink(
  initial: readonly LauncherCurrentMatterWatchpointEvent[] = []
): InMemoryLauncherCurrentMatterWatchpointEventSink {
  const events = initial.map((event) => cloneUnknown(event));

  return {
    write(event) {
      events.push(cloneUnknown(event));
    },
    readEvents() {
      return events.map((event) => cloneUnknown(event));
    },
    clear() {
      events.length = 0;
    }
  };
}

export function emitLauncherCurrentMatterWatchpointEvents(
  input: EmitLauncherCurrentMatterWatchpointEventsInput
): LauncherCurrentMatterWatchpointEvent[] {
  const observedAt = input.observedAt ?? new Date().toISOString();
  const sourceSeam = input.sourceSeam ?? "launcherCurrentMatterHandlingActionConsumer";
  const sourceTaskLineage = [
    ...(input.sourceTaskLineage ?? defaultLauncherCurrentMatterWatchpointSourceTaskLineage)
  ];
  const lifecycleStateCategory = deriveLifecycleStateCategory(input.handlingAction);
  const protectedStateFlags = deriveProtectedStateFlags(input.handlingAction);

  const commonEventFields = {
    observedAt,
    sourceSeam,
    sourceTaskLineage,
    lifecycleStateCategory,
    protectedStateFlags,
    clearanceInferred: false as const,
    redactionPosture: "MINIMISED_INTERNAL" as const,
    ...(input.matterLocatorRef
      ? { matterLocatorRef: input.matterLocatorRef }
      : {}),
    ...(input.outputPackageLocatorRef
      ? { outputPackageLocatorRef: input.outputPackageLocatorRef }
      : {}),
    ...(input.auditProvenanceRef
      ? { auditProvenanceRef: input.auditProvenanceRef }
      : {}),
    ...deriveOutcomeCodes(input.handlingAction)
  };

  const eventTypes: LauncherCurrentMatterWatchpointEventFamily[] = [
    "WATCH_LIFECYCLE_RESUME_STATE_OBSERVED",
    "WATCH_LIFECYCLE_NONLIFECYCLE_SEPARATION_OBSERVED"
  ];

  if (protectedStateFlags.noRecordFlag) {
    eventTypes.push("WATCH_LIFECYCLE_NO_RECORD_OBSERVED");
  }

  if (protectedStateFlags.cannotSafelyResumeFlag) {
    eventTypes.push("WATCH_LIFECYCLE_CANNOT_RESUME_OBSERVED");
  }

  if (protectedStateFlags.noRoutingSignalFlag) {
    eventTypes.push("WATCH_LIFECYCLE_NO_ROUTING_SIGNAL_OBSERVED");
  }

  if (protectedStateFlags.holdAwareFlag || protectedStateFlags.releaseControlledFlag) {
    eventTypes.push("WATCH_LIFECYCLE_HOLD_RELEASE_STATE_OBSERVED");
  }

  if (protectedStateFlags.lifecycleRouteKind !== "NONE") {
    eventTypes.push("WATCH_LIFECYCLE_ACTION_ROUTE_OBSERVED");
  }

  const emitted: LauncherCurrentMatterWatchpointEvent[] = eventTypes.map((eventType, index) => ({
    eventType,
    eventId: buildLauncherCurrentMatterWatchpointEventId({
      eventType,
      sourceSeam,
      observedAt,
      index,
      ...(input.matterLocatorRef
        ? { matterLocatorRef: input.matterLocatorRef }
        : {}),
      ...(input.outputPackageLocatorRef
        ? { outputPackageLocatorRef: input.outputPackageLocatorRef }
        : {})
    }),
    ...commonEventFields
  }));

  for (const event of emitted) {
    assertValidLauncherCurrentMatterWatchpointEvent(event);
    input.sink.write(event);
  }

  return emitted;
}

export function emitLauncherCurrentMatterWatchpointEventsFromOutputCheckpoint(
  input: EmitLauncherCurrentMatterWatchpointEventsFromOutputCheckpointInput
): {
  handlingAction: LauncherCurrentMatterInternalHandlingAction;
  emittedEvents: LauncherCurrentMatterWatchpointEvent[];
} {
  const handlingAction =
    consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
      outputCheckpoint: input.outputCheckpoint,
      ...(input.nonLifecycleTransitionInput
        ? { nonLifecycleTransitionInput: input.nonLifecycleTransitionInput }
        : {})
    });

  const locator = input.outputCheckpoint.outputPackageLifecycleResumeCheckpoint?.locator;
  const emittedEvents = emitLauncherCurrentMatterWatchpointEvents({
    sink: input.sink,
    handlingAction,
    ...(input.sourceSeam
      ? { sourceSeam: input.sourceSeam }
      : {}),
    ...(input.observedAt
      ? { observedAt: input.observedAt }
      : {}),
    ...(input.sourceTaskLineage
      ? { sourceTaskLineage: input.sourceTaskLineage }
      : {}),
    matterLocatorRef: `matter:${input.outputCheckpoint.matterId}`,
    ...(locator
      ? {
        outputPackageLocatorRef: `outputPackage:${locator.outputPackageId}`,
        auditProvenanceRef: `lifecycleRequest:${locator.lifecycleRequestId}`
      }
      : {})
  });

  return {
    handlingAction,
    emittedEvents
  };
}

export function assertValidLauncherCurrentMatterWatchpointEvent(
  event: unknown
): asserts event is LauncherCurrentMatterWatchpointEvent {
  if (!isRecord(event)) {
    throw new Error("Watchpoint event payload must be an object.");
  }

  if (!isWatchpointEventFamily(event.eventType)) {
    throw new Error("Watchpoint eventType must be one of the allowed internal families.");
  }

  if (!isNonEmptyString(event.eventId)) {
    throw new Error("Watchpoint eventId must be present.");
  }

  if (!isNonEmptyString(event.observedAt) || Number.isNaN(Date.parse(event.observedAt))) {
    throw new Error("Watchpoint observedAt must be a valid ISO timestamp string.");
  }

  if (!isWatchpointSourceSeam(event.sourceSeam)) {
    throw new Error("Watchpoint sourceSeam must be one of the allowed internal seams.");
  }

  if (!isStringArray(event.sourceTaskLineage)) {
    throw new Error("Watchpoint sourceTaskLineage must be a string array.");
  }

  if (!isLifecycleStateCategory(event.lifecycleStateCategory)) {
    throw new Error("Watchpoint lifecycleStateCategory must be a valid internal category.");
  }

  if (!isProtectedStateFlags(event.protectedStateFlags)) {
    throw new Error("Watchpoint protectedStateFlags must include the required guardrail flags.");
  }

  if (event.clearanceInferred !== false) {
    throw new Error("Watchpoint clearanceInferred must always be false.");
  }

  if (!isRedactionPosture(event.redactionPosture)) {
    throw new Error("Watchpoint redactionPosture must be MINIMISED_INTERNAL.");
  }

  if (event.protectedStateFlags.noRecordFlag && event.clearanceInferred !== false) {
    throw new Error("No-record watchpoints must remain non-clearance.");
  }

  if (event.protectedStateFlags.noRoutingSignalFlag && event.eventType === "WATCH_LIFECYCLE_RESUME_STATE_OBSERVED") {
    // Allowed, but explicit no-signal event must also be emitted by emitter logic.
    // Validation of emission completeness remains in tests.
  }

  assertEventTypeUsesNoForbiddenSemantics(event.eventType);
  assertNoForbiddenPayloadFields(event);
}

function deriveLifecycleStateCategory(
  handlingAction: LauncherCurrentMatterInternalHandlingAction
): LauncherCurrentMatterWatchpointLifecycleStateCategory {
  if (handlingAction.explicitNoRoutingSignalInternalHandling) {
    return "LIFECYCLE_NO_ROUTING_SIGNAL";
  }

  if (handlingAction.failSafeHoldInternalHandling) {
    return "LIFECYCLE_CANNOT_SAFELY_RESUME";
  }

  if (handlingAction.continueInternalNoRecordNonClearance) {
    return "LIFECYCLE_NO_RECORD_NON_CLEARANCE";
  }

  return "LIFECYCLE_CONTEXT_PRESENT";
}

function deriveProtectedStateFlags(
  handlingAction: LauncherCurrentMatterInternalHandlingAction
): LauncherCurrentMatterWatchpointProtectedStateFlags {
  return {
    cannotSafelyResumeFlag: handlingAction.failSafeHoldInternalHandling,
    noRecordFlag: handlingAction.continueInternalNoRecordNonClearance,
    noRoutingSignalFlag: handlingAction.explicitNoRoutingSignalInternalHandling,
    holdAwareFlag: handlingAction.holdAwareLifecycleStatePresent,
    releaseControlledFlag: handlingAction.releaseControlledLifecycleStatePresent,
    lifecycleNonLifecycleSeparationFlag: true,
    lifecycleRouteKind: toWatchpointRouteKind(handlingAction.lifecycleRoute)
  };
}

function toWatchpointRouteKind(
  lifecycleRoute: Br04LifecycleRouteKind | "NONE"
): LauncherCurrentMatterWatchpointRouteKind {
  if (lifecycleRoute === "DELETION_REQUEST") {
    return "DELETION_REQUEST";
  }

  if (lifecycleRoute === "DEIDENTIFICATION_ACTION") {
    return "DEIDENTIFICATION_ACTION";
  }

  return "NONE";
}

function deriveOutcomeCodes(
  handlingAction: LauncherCurrentMatterInternalHandlingAction
): {
  routingOutcomeCode?: string;
  controlOutcomeCode?: string;
  directiveCode: string;
  handlingActionCode: string;
} {
  const routingOutcomeCode =
    handlingAction.lifecycleTransitionState.lifecycleExecutionRouting?.outcome;

  return {
    ...(routingOutcomeCode
      ? { routingOutcomeCode }
      : {}),
    controlOutcomeCode:
      handlingAction.lifecycleTransitionState.lifecycleExecutionControl.outcome,
    directiveCode: handlingAction.executionDirective.directive,
    handlingActionCode: handlingAction.handlingAction
  };
}

function buildLauncherCurrentMatterWatchpointEventId(input: {
  eventType: LauncherCurrentMatterWatchpointEventFamily;
  sourceSeam: LauncherCurrentMatterWatchpointSourceSeam;
  observedAt: string;
  index: number;
  matterLocatorRef?: string;
  outputPackageLocatorRef?: string;
}): string {
  const scopePart = [
    input.matterLocatorRef ?? "matter:none",
    input.outputPackageLocatorRef ?? "output:none"
  ].join("|");

  return [
    input.eventType,
    input.sourceSeam,
    input.observedAt,
    String(input.index),
    scopePart
  ].join("::");
}

function assertEventTypeUsesNoForbiddenSemantics(eventType: string): void {
  const lower = eventType.toLowerCase();

  for (const token of launcherCurrentMatterWatchpointForbiddenSemanticTokens) {
    if (lower.includes(token)) {
      throw new Error(
        `Watchpoint eventType ${eventType} contains forbidden semantic token ${token}.`
      );
    }
  }
}

function assertNoForbiddenPayloadFields(event: Record<string, unknown>): void {
  const forbiddenFieldNames = new Set([
    "tenantName",
    "tenantEmail",
    "tenantPhone",
    "renterName",
    "renterEmail",
    "renterPhone",
    "legalFacts",
    "legalFactsText",
    "documentContents",
    "documentContent",
    "officialCredential",
    "officialCredentials",
    "officialIdentifier",
    "officialIdentifiers",
    "portalCredential",
    "portalCredentials",
    "portalPassword",
    "addressLine1",
    "addressLine2",
    "paymentAmount",
    "paymentDetails",
    "paymentReference",
    "statusLabel",
    "ctaLabel",
    "publicEventName",
    "analyticsCopy",
    "message",
    "body",
    "copy"
  ]);

  for (const key of Object.keys(event)) {
    if (forbiddenFieldNames.has(key)) {
      throw new Error(
        `Watchpoint event payload includes forbidden field ${key}.`
      );
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isWatchpointEventFamily(value: unknown): value is LauncherCurrentMatterWatchpointEventFamily {
  return typeof value === "string"
    && launcherCurrentMatterWatchpointEventFamilies.includes(
      value as LauncherCurrentMatterWatchpointEventFamily
    );
}

function isWatchpointSourceSeam(value: unknown): value is LauncherCurrentMatterWatchpointSourceSeam {
  return typeof value === "string"
    && launcherCurrentMatterWatchpointSourceSeams.includes(
      value as LauncherCurrentMatterWatchpointSourceSeam
    );
}

function isLifecycleStateCategory(
  value: unknown
): value is LauncherCurrentMatterWatchpointLifecycleStateCategory {
  return typeof value === "string"
    && launcherCurrentMatterWatchpointLifecycleStateCategories.includes(
      value as LauncherCurrentMatterWatchpointLifecycleStateCategory
    );
}

function isWatchpointRouteKind(value: unknown): value is LauncherCurrentMatterWatchpointRouteKind {
  return typeof value === "string"
    && launcherCurrentMatterWatchpointRouteKinds.includes(
      value as LauncherCurrentMatterWatchpointRouteKind
    );
}

function isRedactionPosture(value: unknown): value is LauncherCurrentMatterWatchpointRedactionPosture {
  return typeof value === "string"
    && launcherCurrentMatterWatchpointRedactionPostures.includes(
      value as LauncherCurrentMatterWatchpointRedactionPosture
    );
}

function isProtectedStateFlags(value: unknown): value is LauncherCurrentMatterWatchpointProtectedStateFlags {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.cannotSafelyResumeFlag === "boolean"
    && typeof value.noRecordFlag === "boolean"
    && typeof value.noRoutingSignalFlag === "boolean"
    && typeof value.holdAwareFlag === "boolean"
    && typeof value.releaseControlledFlag === "boolean"
    && typeof value.lifecycleNonLifecycleSeparationFlag === "boolean"
    && isWatchpointRouteKind(value.lifecycleRouteKind);
}

function cloneUnknown<T>(value: T): T {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}
