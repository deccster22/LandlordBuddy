import {
  assertValidLauncherCurrentMatterWatchpointEvent,
  launcherCurrentMatterWatchpointForbiddenSemanticTokens,
  type InMemoryLauncherCurrentMatterWatchpointEventSink,
  type LauncherCurrentMatterWatchpointEvent,
  type LauncherCurrentMatterWatchpointEventFamily,
  type LauncherCurrentMatterWatchpointRouteKind,
  type LauncherCurrentMatterWatchpointSourceSeam
} from "./launcherCurrentMatterWatchpointLoggingEmitter.js";
import {
  consumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsFromOutputCheckpoint,
  type ConsumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsResult
} from "./launcherCurrentMatterWatchpointWiredCaller.js";
import type {
  LauncherCurrentMatterInternalHandlingAction
} from "./launcherCurrentMatterHandlingActionConsumer.js";
import type {
  HydrateOutputCheckpointInput
} from "./outputHandoffCheckpointHydration.js";
import type {
  LauncherCurrentMatterNonLifecycleTransitionInput
} from "./launcherCurrentMatterTransitionOrchestrationEntry.js";

export const launcherCurrentMatterWatchpointForbiddenPayloadFields = [
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
] as const;

export interface LauncherCurrentMatterWatchpointRegressionDiagnosticsExpectations {
  requireLifecycleResumeObserved?: boolean;
  requireNoRecordNonClearance?: boolean;
  requireCannotSafelyResume?: boolean;
  requireExplicitNoRoutingSignal?: boolean;
  requireHoldAwareState?: boolean;
  requireReleaseControlledState?: boolean;
  requireLifecycleNonLifecycleSeparation?: boolean;
  requiredLifecycleRouteKinds?: readonly LauncherCurrentMatterWatchpointRouteKind[];
}

interface LauncherCurrentMatterWatchpointResolvedDiagnosticsExpectations {
  requireLifecycleResumeObserved: boolean;
  requireNoRecordNonClearance: boolean;
  requireCannotSafelyResume: boolean;
  requireExplicitNoRoutingSignal: boolean;
  requireHoldAwareState: boolean;
  requireReleaseControlledState: boolean;
  requireLifecycleNonLifecycleSeparation: boolean;
  requiredLifecycleRouteKinds: LauncherCurrentMatterWatchpointRouteKind[];
}

export interface LauncherCurrentMatterWatchpointRegressionDiagnosticsSummary {
  passed: boolean;
  findings: string[];
  inspectedEventCount: number;
  validatedEventCount: number;
  observedEventTypes: LauncherCurrentMatterWatchpointEventFamily[];
  observedLifecycleRouteKinds: LauncherCurrentMatterWatchpointRouteKind[];
  sinkCaptureParity: boolean;
  expectationsApplied: LauncherCurrentMatterWatchpointResolvedDiagnosticsExpectations;
}

export interface DiagnoseLauncherCurrentMatterWatchpointEventsInput {
  events: readonly unknown[];
  expectations?: LauncherCurrentMatterWatchpointRegressionDiagnosticsExpectations;
}

export interface RunLauncherCurrentMatterWatchpointRegressionDiagnosticsInput {
  outputCheckpoint: HydrateOutputCheckpointInput;
  nonLifecycleTransitionInput?: LauncherCurrentMatterNonLifecycleTransitionInput;
  watchpointSink: InMemoryLauncherCurrentMatterWatchpointEventSink;
  watchpointObservedAt?: string;
  watchpointSourceSeam?: LauncherCurrentMatterWatchpointSourceSeam;
  watchpointSourceTaskLineage?: readonly string[];
  expectations?: LauncherCurrentMatterWatchpointRegressionDiagnosticsExpectations;
}

export interface RunLauncherCurrentMatterWatchpointRegressionDiagnosticsResult {
  handlingAction: LauncherCurrentMatterInternalHandlingAction;
  emittedWatchpointEvents: LauncherCurrentMatterWatchpointEvent[];
  diagnostics: LauncherCurrentMatterWatchpointRegressionDiagnosticsSummary;
}

const defaultDiagnosticsExpectations: LauncherCurrentMatterWatchpointResolvedDiagnosticsExpectations = {
  requireLifecycleResumeObserved: true,
  requireNoRecordNonClearance: false,
  requireCannotSafelyResume: false,
  requireExplicitNoRoutingSignal: false,
  requireHoldAwareState: false,
  requireReleaseControlledState: false,
  requireLifecycleNonLifecycleSeparation: true,
  requiredLifecycleRouteKinds: []
};

const forbiddenPayloadFieldNames = new Set<string>(
  [...launcherCurrentMatterWatchpointForbiddenPayloadFields]
);

export function runLauncherCurrentMatterWatchpointRegressionDiagnosticsFromOutputCheckpoint(
  input: RunLauncherCurrentMatterWatchpointRegressionDiagnosticsInput
): RunLauncherCurrentMatterWatchpointRegressionDiagnosticsResult {
  if (!isInMemoryDiagnosticsSink(input.watchpointSink)) {
    throw new Error(
      "Regression diagnostics require an explicit injected in-memory watchpoint sink."
    );
  }

  input.watchpointSink.clear();
  const executionResult =
    consumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsFromOutputCheckpoint({
      outputCheckpoint: input.outputCheckpoint,
      ...(input.nonLifecycleTransitionInput
        ? { nonLifecycleTransitionInput: input.nonLifecycleTransitionInput }
        : {}),
      watchpointSink: input.watchpointSink,
      ...(input.watchpointObservedAt
        ? { watchpointObservedAt: input.watchpointObservedAt }
        : {}),
      ...(input.watchpointSourceSeam
        ? { watchpointSourceSeam: input.watchpointSourceSeam }
        : {}),
      ...(input.watchpointSourceTaskLineage
        ? { watchpointSourceTaskLineage: input.watchpointSourceTaskLineage }
        : {})
    });

  const capturedEvents = input.watchpointSink.readEvents();
  const sinkCaptureParity = areWatchpointEventsEquivalent({
    emittedEvents: executionResult.emittedWatchpointEvents,
    capturedEvents
  });
  const expectations = resolveDiagnosticsExpectations({
    handlingAction: executionResult.handlingAction,
    ...(input.expectations
      ? { overrides: input.expectations }
      : {})
  });
  const diagnostics = diagnoseLauncherCurrentMatterWatchpointEvents({
    events: capturedEvents,
    expectations
  });

  const findings = sinkCaptureParity
    ? diagnostics.findings
    : [
      ...diagnostics.findings,
      "Injected sink capture does not match emitted watchpoint events."
    ];

  return {
    handlingAction: executionResult.handlingAction,
    emittedWatchpointEvents: executionResult.emittedWatchpointEvents,
    diagnostics: {
      ...diagnostics,
      sinkCaptureParity,
      passed: sinkCaptureParity && diagnostics.passed,
      findings,
      expectationsApplied: expectations
    }
  };
}

export function diagnoseLauncherCurrentMatterWatchpointEvents(
  input: DiagnoseLauncherCurrentMatterWatchpointEventsInput
): LauncherCurrentMatterWatchpointRegressionDiagnosticsSummary {
  const findings: string[] = [];
  const validatedEvents: LauncherCurrentMatterWatchpointEvent[] = [];
  const expectations = resolveDiagnosticsExpectations({
    ...(input.expectations
      ? { overrides: input.expectations }
      : {})
  });

  input.events.forEach((candidate, index) => {
    if (!isRecord(candidate)) {
      findings.push(`Event at index ${index} is not an object.`);
      return;
    }

    if (typeof candidate.eventType === "string") {
      const forbiddenSemanticToken = findForbiddenSemanticToken(candidate.eventType);

      if (forbiddenSemanticToken) {
        findings.push(
          `Event at index ${index} contains forbidden semantic token ${forbiddenSemanticToken} in eventType.`
        );
      }
    }

    const forbiddenFields = Object.keys(candidate).filter((fieldName) =>
      forbiddenPayloadFieldNames.has(fieldName)
    );

    for (const forbiddenField of forbiddenFields) {
      findings.push(
        `Event at index ${index} includes forbidden payload field ${forbiddenField}.`
      );
    }

    try {
      assertValidLauncherCurrentMatterWatchpointEvent(candidate);
      validatedEvents.push(candidate);
    } catch (error) {
      findings.push(
        `Event at index ${index} failed watchpoint schema validation: ${toErrorMessage(error)}`
      );
    }
  });

  const observedEventTypes = [...new Set(
    validatedEvents.map((event) => event.eventType)
  )];
  const observedLifecycleRouteKinds = [...new Set(
    validatedEvents.map((event) => event.protectedStateFlags.lifecycleRouteKind)
  )];

  if (expectations.requireLifecycleResumeObserved
    && !observedEventTypes.includes("WATCH_LIFECYCLE_RESUME_STATE_OBSERVED")) {
    findings.push("Expected WATCH_LIFECYCLE_RESUME_STATE_OBSERVED event was not observed.");
  }

  if (expectations.requireNoRecordNonClearance) {
    if (!observedEventTypes.includes("WATCH_LIFECYCLE_NO_RECORD_OBSERVED")) {
      findings.push("Expected WATCH_LIFECYCLE_NO_RECORD_OBSERVED event was not observed.");
    }

    if (!validatedEvents.some((event) =>
      event.protectedStateFlags.noRecordFlag && event.clearanceInferred === false
    )) {
      findings.push(
        "No-record non-clearance diagnostic failed: expected noRecordFlag=true with clearanceInferred=false."
      );
    }
  }

  if (expectations.requireCannotSafelyResume) {
    if (!observedEventTypes.includes("WATCH_LIFECYCLE_CANNOT_RESUME_OBSERVED")) {
      findings.push("Expected WATCH_LIFECYCLE_CANNOT_RESUME_OBSERVED event was not observed.");
    }

    if (!validatedEvents.some((event) => event.protectedStateFlags.cannotSafelyResumeFlag)) {
      findings.push(
        "Cannot-safely-resume diagnostic failed: expected cannotSafelyResumeFlag=true."
      );
    }
  }

  if (expectations.requireExplicitNoRoutingSignal) {
    if (!observedEventTypes.includes("WATCH_LIFECYCLE_NO_ROUTING_SIGNAL_OBSERVED")) {
      findings.push("Expected WATCH_LIFECYCLE_NO_ROUTING_SIGNAL_OBSERVED event was not observed.");
    }

    if (!validatedEvents.some((event) => event.protectedStateFlags.noRoutingSignalFlag)) {
      findings.push(
        "No-signal diagnostic failed: expected noRoutingSignalFlag=true."
      );
    }
  }

  if (expectations.requireHoldAwareState) {
    if (!observedEventTypes.includes("WATCH_LIFECYCLE_HOLD_RELEASE_STATE_OBSERVED")) {
      findings.push("Expected WATCH_LIFECYCLE_HOLD_RELEASE_STATE_OBSERVED event was not observed.");
    }

    if (!validatedEvents.some((event) => event.protectedStateFlags.holdAwareFlag)) {
      findings.push("Hold-aware diagnostic failed: expected holdAwareFlag=true.");
    }
  }

  if (expectations.requireReleaseControlledState) {
    if (!observedEventTypes.includes("WATCH_LIFECYCLE_HOLD_RELEASE_STATE_OBSERVED")) {
      findings.push("Expected WATCH_LIFECYCLE_HOLD_RELEASE_STATE_OBSERVED event was not observed.");
    }

    if (!validatedEvents.some((event) => event.protectedStateFlags.releaseControlledFlag)) {
      findings.push("Release-controlled diagnostic failed: expected releaseControlledFlag=true.");
    }
  }

  if (expectations.requireLifecycleNonLifecycleSeparation) {
    if (!observedEventTypes.includes("WATCH_LIFECYCLE_NONLIFECYCLE_SEPARATION_OBSERVED")) {
      findings.push(
        "Expected WATCH_LIFECYCLE_NONLIFECYCLE_SEPARATION_OBSERVED event was not observed."
      );
    }

    if (validatedEvents.some((event) =>
      event.protectedStateFlags.lifecycleNonLifecycleSeparationFlag !== true
    )) {
      findings.push(
        "Lifecycle/non-lifecycle separation diagnostic failed: expected lifecycleNonLifecycleSeparationFlag=true."
      );
    }
  }

  for (const requiredRouteKind of expectations.requiredLifecycleRouteKinds) {
    if (!observedLifecycleRouteKinds.includes(requiredRouteKind)) {
      findings.push(
        `Expected lifecycle route kind ${requiredRouteKind} was not observed.`
      );
    }
  }

  return {
    passed: findings.length === 0,
    findings,
    inspectedEventCount: input.events.length,
    validatedEventCount: validatedEvents.length,
    observedEventTypes,
    observedLifecycleRouteKinds,
    sinkCaptureParity: true,
    expectationsApplied: expectations
  };
}

function resolveDiagnosticsExpectations(input: {
  handlingAction?: LauncherCurrentMatterInternalHandlingAction;
  overrides?: LauncherCurrentMatterWatchpointRegressionDiagnosticsExpectations;
}): LauncherCurrentMatterWatchpointResolvedDiagnosticsExpectations {
  const derivedRequiredLifecycleRouteKinds =
    input.handlingAction && input.handlingAction.lifecycleRoute !== "NONE"
      ? [input.handlingAction.lifecycleRoute]
      : [];

  const overrideRouteKinds = input.overrides?.requiredLifecycleRouteKinds;

  return {
    requireLifecycleResumeObserved:
      input.overrides?.requireLifecycleResumeObserved
      ?? defaultDiagnosticsExpectations.requireLifecycleResumeObserved,
    requireNoRecordNonClearance:
      input.overrides?.requireNoRecordNonClearance
      ?? input.handlingAction?.continueInternalNoRecordNonClearance
      ?? defaultDiagnosticsExpectations.requireNoRecordNonClearance,
    requireCannotSafelyResume:
      input.overrides?.requireCannotSafelyResume
      ?? input.handlingAction?.failSafeHoldInternalHandling
      ?? defaultDiagnosticsExpectations.requireCannotSafelyResume,
    requireExplicitNoRoutingSignal:
      input.overrides?.requireExplicitNoRoutingSignal
      ?? input.handlingAction?.explicitNoRoutingSignalInternalHandling
      ?? defaultDiagnosticsExpectations.requireExplicitNoRoutingSignal,
    requireHoldAwareState:
      input.overrides?.requireHoldAwareState
      ?? input.handlingAction?.holdAwareLifecycleStatePresent
      ?? defaultDiagnosticsExpectations.requireHoldAwareState,
    requireReleaseControlledState:
      input.overrides?.requireReleaseControlledState
      ?? input.handlingAction?.releaseControlledLifecycleStatePresent
      ?? defaultDiagnosticsExpectations.requireReleaseControlledState,
    requireLifecycleNonLifecycleSeparation:
      input.overrides?.requireLifecycleNonLifecycleSeparation
      ?? defaultDiagnosticsExpectations.requireLifecycleNonLifecycleSeparation,
    requiredLifecycleRouteKinds: overrideRouteKinds
      ? [...overrideRouteKinds]
      : derivedRequiredLifecycleRouteKinds
  };
}

function areWatchpointEventsEquivalent(input: {
  emittedEvents: readonly LauncherCurrentMatterWatchpointEvent[];
  capturedEvents: readonly LauncherCurrentMatterWatchpointEvent[];
}): boolean {
  if (input.emittedEvents.length !== input.capturedEvents.length) {
    return false;
  }

  for (let index = 0; index < input.emittedEvents.length; index += 1) {
    if (toStableJson(input.emittedEvents[index]) !== toStableJson(input.capturedEvents[index])) {
      return false;
    }
  }

  return true;
}

function findForbiddenSemanticToken(eventType: string): string | null {
  const lower = eventType.toLowerCase();

  for (const token of launcherCurrentMatterWatchpointForbiddenSemanticTokens) {
    if (lower.includes(token)) {
      return token;
    }
  }

  return null;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toStableJson(value: unknown): string {
  return JSON.stringify(value);
}

function isInMemoryDiagnosticsSink(value: unknown): value is InMemoryLauncherCurrentMatterWatchpointEventSink {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.write === "function"
    && typeof value.readEvents === "function"
    && typeof value.clear === "function";
}
