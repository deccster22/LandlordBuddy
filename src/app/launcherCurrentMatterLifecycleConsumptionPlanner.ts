import type { Br04LifecycleRouteKind } from "../modules/br04/index.js";
import {
  consumeLauncherCurrentMatterExecutionDirective,
  type LauncherCurrentMatterExecutionDirective,
  type LauncherCurrentMatterExecutionDirectiveOutcome
} from "./launcherCurrentMatterExecutionDirectiveConsumer.js";
import {
  consumeLauncherCurrentMatterInternalHandlingAction,
  consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint,
  type LauncherCurrentMatterInternalHandlingAction,
  type LauncherCurrentMatterInternalHandlingActionOutcome
} from "./launcherCurrentMatterHandlingActionConsumer.js";
import type {
  LauncherCurrentMatterExecutionControlOutcome,
  LauncherCurrentMatterExecutionControlResult
} from "./launcherCurrentMatterExecutionCaller.js";
import type {
  LauncherCurrentMatterFollowOnRouteOutcome,
  LauncherCurrentMatterFollowOnRouteDecision
} from "./launcherCurrentMatterFollowOnRouteCoordinator.js";
import type {
  LauncherCurrentMatterExecutionRoutingOutcome,
  LauncherCurrentMatterExecutionRoutingResult
} from "./launcherCurrentMatterExecutionRouting.js";
import type {
  HydrateOutputCheckpointInput
} from "./outputHandoffCheckpointHydration.js";
import type {
  LauncherCurrentMatterNonLifecycleTransitionInput,
  LauncherCurrentMatterNonLifecycleTransitionState,
  LauncherCurrentMatterTransitionOrchestrationDecision,
  LauncherCurrentMatterTransitionOrchestrationHandlingMode,
  LauncherCurrentMatterTransitionOrchestrationTarget
} from "./launcherCurrentMatterTransitionOrchestrationEntry.js";
import type {
  LauncherCurrentMatterTransitionSelection,
  LauncherCurrentMatterInternalTransitionHandlingMode,
  LauncherCurrentMatterInternalTransitionTarget
} from "./launcherCurrentMatterTransitionSelector.js";
import type {
  LauncherCurrentMatterWatchpointRegressionDiagnosticsSummary
} from "./launcherCurrentMatterWatchpointRegressionDiagnostics.js";

export const launcherCurrentMatterLifecycleConsumptionPlannerKind =
  "SCRC_01_INTERNAL_LIFECYCLE_CONSUMPTION_PLANNER" as const;

export const launcherCurrentMatterLifecycleConsumptionPlanningOutcomes = [
  "PLAN_INTERNAL_CONTINUE_WITH_LIFECYCLE_CONTEXT",
  "PLAN_INTERNAL_CONTINUE_NO_RECORD_NON_CLEARANCE",
  "PLAN_INTERNAL_HOLD_CANNOT_SAFELY_RESUME",
  "PLAN_INTERNAL_EXPLICIT_NO_ROUTING_SIGNAL"
] as const;

export type LauncherCurrentMatterLifecycleConsumptionPlanningOutcome =
  (typeof launcherCurrentMatterLifecycleConsumptionPlanningOutcomes)[number];

export const launcherCurrentMatterLifecycleConsumptionAllowedInternalUse = [
  "ALLOW_SHELL_CURRENT_MATTER_PLANNING_STATE",
  "ALLOW_INTERNAL_CONTINUATION_ELIGIBILITY_PLANNING",
  "ALLOW_INTERNAL_FAIL_SAFE_INTERRUPTION_PLANNING",
  "ALLOW_INTERNAL_LIFECYCLE_CONTEXT_PRESERVATION",
  "ALLOW_INTERNAL_QA_DEBUG_TRACEABILITY",
  "ALLOW_FUTURE_NON_VISUAL_ORCHESTRATION_PLANNING"
] as const;

export type LauncherCurrentMatterLifecycleConsumptionAllowedInternalUse =
  (typeof launcherCurrentMatterLifecycleConsumptionAllowedInternalUse)[number];

export const launcherCurrentMatterLifecycleConsumptionForbiddenConversions = [
  "FORBID_USER_FACING_LIFECYCLE_LABEL",
  "FORBID_SUCCESS_STATE_LABEL",
  "FORBID_COMPLIANCE_STATE_LABEL",
  "FORBID_LEGAL_SUFFICIENCY_STATE_LABEL",
  "FORBID_OFFICIAL_FILING_STATE_LABEL",
  "FORBID_CTA_WORDING_OR_HIERARCHY",
  "FORBID_RENDERED_STATE_PANEL",
  "FORBID_RENDERED_WARNING_BLOCK",
  "FORBID_ANALYTICS_ADMIN_SUPPORT_LABEL",
  "FORBID_EXPORTED_OR_USER_VISIBLE_LOG"
] as const;

export type LauncherCurrentMatterLifecycleConsumptionForbiddenConversion =
  (typeof launcherCurrentMatterLifecycleConsumptionForbiddenConversions)[number];

export interface LauncherCurrentMatterLifecycleConsumptionPlannerLineage {
  executionRoutingOutcome?: LauncherCurrentMatterExecutionRoutingOutcome;
  executionControlOutcome: LauncherCurrentMatterExecutionControlOutcome;
  followOnRouteOutcome: LauncherCurrentMatterFollowOnRouteOutcome;
  transitionTarget: LauncherCurrentMatterInternalTransitionTarget;
  transitionHandlingMode: LauncherCurrentMatterInternalTransitionHandlingMode;
  orchestrationTarget: LauncherCurrentMatterTransitionOrchestrationTarget;
  orchestrationHandlingMode: LauncherCurrentMatterTransitionOrchestrationHandlingMode;
  directiveOutcome: LauncherCurrentMatterExecutionDirectiveOutcome;
  handlingActionOutcome: LauncherCurrentMatterInternalHandlingActionOutcome;
  resumeRecordKey?: string;
}

export interface LauncherCurrentMatterLifecycleConsumptionPlannerLifecycleSlice {
  lifecycleResumeRoutingSignal?:
    LauncherCurrentMatterExecutionRoutingResult extends infer R
      ? R extends { launcherCurrentMatterLifecycleResumeRouting: infer S }
        ? S
        : never
      : never;
  executionRouting?: LauncherCurrentMatterExecutionRoutingResult;
  executionControl: LauncherCurrentMatterExecutionControlResult;
  followOnRouteDecision: LauncherCurrentMatterFollowOnRouteDecision;
  transitionSelection: LauncherCurrentMatterTransitionSelection;
  transitionOrchestrationDecision: LauncherCurrentMatterTransitionOrchestrationDecision;
  executionDirective: LauncherCurrentMatterExecutionDirective;
  handlingAction: LauncherCurrentMatterInternalHandlingAction;
}

export interface LauncherCurrentMatterLifecycleConsumptionPlannerNonLifecycleSlice {
  transitionState: LauncherCurrentMatterNonLifecycleTransitionState;
  holdRequested: boolean;
}

export interface LauncherCurrentMatterLifecycleConsumptionPlannerQaContext {
  source: "WATCHPOINT_DIAGNOSTICS_INTERNAL_QA_CONTEXT";
  diagnosticsPassed: boolean;
  findingsCount: number;
  observedEventTypes: string[];
  observedLifecycleRouteKinds: string[];
  sinkCaptureParity: boolean;
}

export interface LauncherCurrentMatterLifecycleConsumptionPlannerBase {
  plannerKind: typeof launcherCurrentMatterLifecycleConsumptionPlannerKind;
  sourceContract: "P4C-CX-APP-CONSUME-02";
  planningOutcome: LauncherCurrentMatterLifecycleConsumptionPlanningOutcome;
  clearanceInferred: false;
  proceedWithInternalPlanning: boolean;
  lifecycleContextPreservationPlanning: boolean;
  continuationEligibilityPlanning: boolean;
  failSafeInterruptionPlanning: boolean;
  noRecordNonClearancePlanning: boolean;
  explicitNoRoutingSignalPlanning: boolean;
  lifecycleRoute: Br04LifecycleRouteKind | "NONE";
  holdAwareLifecycleStatePresent: boolean;
  releaseControlledLifecycleStatePresent: boolean;
  deletionRequestPresent: boolean;
  deidentificationActionPresent: boolean;
  lifecycleSlice: LauncherCurrentMatterLifecycleConsumptionPlannerLifecycleSlice;
  nonLifecycleSlice: LauncherCurrentMatterLifecycleConsumptionPlannerNonLifecycleSlice;
  lineage: LauncherCurrentMatterLifecycleConsumptionPlannerLineage;
  allowedInternalUse: readonly LauncherCurrentMatterLifecycleConsumptionAllowedInternalUse[];
  forbiddenConversions: readonly LauncherCurrentMatterLifecycleConsumptionForbiddenConversion[];
  renderingAuthorized: false;
  uiCopyAuthorized: false;
  statusLabelAuthorized: false;
  ctaAuthorized: false;
  watchpointExpansionAuthorized: false;
  analyticsAdminSupportExportAuthorized: false;
  qaDiagnosticsContext?: LauncherCurrentMatterLifecycleConsumptionPlannerQaContext;
}

export interface PlanInternalContinueWithLifecycleContext
  extends LauncherCurrentMatterLifecycleConsumptionPlannerBase {
  planningOutcome: "PLAN_INTERNAL_CONTINUE_WITH_LIFECYCLE_CONTEXT";
  proceedWithInternalPlanning: true;
  lifecycleContextPreservationPlanning: true;
  continuationEligibilityPlanning: true;
  failSafeInterruptionPlanning: false;
  noRecordNonClearancePlanning: false;
  explicitNoRoutingSignalPlanning: false;
}

export interface PlanInternalContinueNoRecordNonClearance
  extends LauncherCurrentMatterLifecycleConsumptionPlannerBase {
  planningOutcome: "PLAN_INTERNAL_CONTINUE_NO_RECORD_NON_CLEARANCE";
  proceedWithInternalPlanning: true;
  lifecycleContextPreservationPlanning: false;
  continuationEligibilityPlanning: true;
  failSafeInterruptionPlanning: false;
  noRecordNonClearancePlanning: true;
  explicitNoRoutingSignalPlanning: false;
}

export interface PlanInternalHoldCannotSafelyResume
  extends LauncherCurrentMatterLifecycleConsumptionPlannerBase {
  planningOutcome: "PLAN_INTERNAL_HOLD_CANNOT_SAFELY_RESUME";
  proceedWithInternalPlanning: false;
  lifecycleContextPreservationPlanning: false;
  continuationEligibilityPlanning: false;
  failSafeInterruptionPlanning: true;
  noRecordNonClearancePlanning: false;
  explicitNoRoutingSignalPlanning: false;
}

export interface PlanInternalExplicitNoRoutingSignal
  extends LauncherCurrentMatterLifecycleConsumptionPlannerBase {
  planningOutcome: "PLAN_INTERNAL_EXPLICIT_NO_ROUTING_SIGNAL";
  proceedWithInternalPlanning: false;
  lifecycleContextPreservationPlanning: false;
  continuationEligibilityPlanning: false;
  failSafeInterruptionPlanning: false;
  noRecordNonClearancePlanning: false;
  explicitNoRoutingSignalPlanning: true;
}

export type LauncherCurrentMatterLifecycleConsumptionPlannerResult =
  | PlanInternalContinueWithLifecycleContext
  | PlanInternalContinueNoRecordNonClearance
  | PlanInternalHoldCannotSafelyResume
  | PlanInternalExplicitNoRoutingSignal;

export interface PlanLauncherCurrentMatterLifecycleConsumptionInput {
  handlingAction: LauncherCurrentMatterInternalHandlingAction;
  watchpointDiagnosticsSummary?: LauncherCurrentMatterWatchpointRegressionDiagnosticsSummary;
}

export interface PlanLauncherCurrentMatterLifecycleConsumptionFromOutputCheckpointInput {
  outputCheckpoint: HydrateOutputCheckpointInput;
  nonLifecycleTransitionInput?: LauncherCurrentMatterNonLifecycleTransitionInput;
  watchpointDiagnosticsSummary?: LauncherCurrentMatterWatchpointRegressionDiagnosticsSummary;
}

export function planLauncherCurrentMatterLifecycleConsumption(
  input: PlanLauncherCurrentMatterLifecycleConsumptionInput
): LauncherCurrentMatterLifecycleConsumptionPlannerResult {
  const common = buildCommonPlannerState(input);

  if (input.handlingAction.handlingAction === "ACTION_CONTINUE_INTERNAL_WITH_LIFECYCLE_CONTEXT") {
    return {
      ...common,
      planningOutcome: "PLAN_INTERNAL_CONTINUE_WITH_LIFECYCLE_CONTEXT",
      proceedWithInternalPlanning: true,
      lifecycleContextPreservationPlanning: true,
      continuationEligibilityPlanning: true,
      failSafeInterruptionPlanning: false,
      noRecordNonClearancePlanning: false,
      explicitNoRoutingSignalPlanning: false
    };
  }

  if (input.handlingAction.handlingAction === "ACTION_CONTINUE_INTERNAL_NO_RECORD_NON_CLEARANCE") {
    return {
      ...common,
      planningOutcome: "PLAN_INTERNAL_CONTINUE_NO_RECORD_NON_CLEARANCE",
      proceedWithInternalPlanning: true,
      lifecycleContextPreservationPlanning: false,
      continuationEligibilityPlanning: true,
      failSafeInterruptionPlanning: false,
      noRecordNonClearancePlanning: true,
      explicitNoRoutingSignalPlanning: false
    };
  }

  if (input.handlingAction.handlingAction === "ACTION_HOLD_INTERNAL_CANNOT_SAFELY_RESUME") {
    return {
      ...common,
      planningOutcome: "PLAN_INTERNAL_HOLD_CANNOT_SAFELY_RESUME",
      proceedWithInternalPlanning: false,
      lifecycleContextPreservationPlanning: false,
      continuationEligibilityPlanning: false,
      failSafeInterruptionPlanning: true,
      noRecordNonClearancePlanning: false,
      explicitNoRoutingSignalPlanning: false
    };
  }

  return {
    ...common,
    planningOutcome: "PLAN_INTERNAL_EXPLICIT_NO_ROUTING_SIGNAL",
    proceedWithInternalPlanning: false,
    lifecycleContextPreservationPlanning: false,
    continuationEligibilityPlanning: false,
    failSafeInterruptionPlanning: false,
    noRecordNonClearancePlanning: false,
    explicitNoRoutingSignalPlanning: true
  };
}

export function planLauncherCurrentMatterLifecycleConsumptionFromTransitionOrchestrationDecision(
  input: {
    orchestrationDecision: LauncherCurrentMatterTransitionOrchestrationDecision;
    watchpointDiagnosticsSummary?: LauncherCurrentMatterWatchpointRegressionDiagnosticsSummary;
  }
): LauncherCurrentMatterLifecycleConsumptionPlannerResult {
  const executionDirective = consumeLauncherCurrentMatterExecutionDirective({
    orchestrationDecision: input.orchestrationDecision
  });
  const handlingAction = consumeLauncherCurrentMatterInternalHandlingAction({
    executionDirective
  });

  return planLauncherCurrentMatterLifecycleConsumption({
    handlingAction,
    ...(input.watchpointDiagnosticsSummary
      ? { watchpointDiagnosticsSummary: input.watchpointDiagnosticsSummary }
      : {})
  });
}

export function planLauncherCurrentMatterLifecycleConsumptionFromOutputCheckpoint(
  input: PlanLauncherCurrentMatterLifecycleConsumptionFromOutputCheckpointInput
): LauncherCurrentMatterLifecycleConsumptionPlannerResult {
  const handlingAction = consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
    outputCheckpoint: input.outputCheckpoint,
    ...(input.nonLifecycleTransitionInput
      ? { nonLifecycleTransitionInput: input.nonLifecycleTransitionInput }
      : {})
  });

  return planLauncherCurrentMatterLifecycleConsumption({
    handlingAction,
    ...(input.watchpointDiagnosticsSummary
      ? { watchpointDiagnosticsSummary: input.watchpointDiagnosticsSummary }
      : {})
  });
}

function buildCommonPlannerState(
  input: PlanLauncherCurrentMatterLifecycleConsumptionInput
): Omit<
  LauncherCurrentMatterLifecycleConsumptionPlannerBase,
  | "planningOutcome"
  | "proceedWithInternalPlanning"
  | "lifecycleContextPreservationPlanning"
  | "continuationEligibilityPlanning"
  | "failSafeInterruptionPlanning"
  | "noRecordNonClearancePlanning"
  | "explicitNoRoutingSignalPlanning"
> {
  const handlingAction = input.handlingAction;
  const executionDirective = handlingAction.executionDirective;
  const transitionOrchestrationDecision = executionDirective.orchestrationDecision;
  const transitionSelection = executionDirective.lifecycleTransitionState;
  const executionControl = transitionSelection.lifecycleExecutionControl;
  const followOnRouteDecision = transitionSelection.coordinatorDecision;
  const executionRouting = transitionSelection.lifecycleExecutionRouting;

  return {
    plannerKind: launcherCurrentMatterLifecycleConsumptionPlannerKind,
    sourceContract: "P4C-CX-APP-CONSUME-02",
    clearanceInferred: false,
    lifecycleRoute: handlingAction.lifecycleRoute,
    holdAwareLifecycleStatePresent: handlingAction.holdAwareLifecycleStatePresent,
    releaseControlledLifecycleStatePresent:
      handlingAction.releaseControlledLifecycleStatePresent,
    deletionRequestPresent: handlingAction.deletionRequestPresent,
    deidentificationActionPresent: handlingAction.deidentificationActionPresent,
    lifecycleSlice: {
      ...(executionRouting && "launcherCurrentMatterLifecycleResumeRouting" in executionRouting
        ? {
            lifecycleResumeRoutingSignal:
              executionRouting.launcherCurrentMatterLifecycleResumeRouting
          }
        : {}),
      ...(executionRouting
        ? { executionRouting }
        : {}),
      executionControl,
      followOnRouteDecision,
      transitionSelection,
      transitionOrchestrationDecision,
      executionDirective,
      handlingAction
    },
    nonLifecycleSlice: {
      transitionState: handlingAction.nonLifecycleTransitionState,
      holdRequested: handlingAction.nonLifecycleHoldRequested
    },
    lineage: {
      ...(executionRouting
        ? { executionRoutingOutcome: executionRouting.outcome }
        : {}),
      executionControlOutcome: executionControl.outcome,
      followOnRouteOutcome: followOnRouteDecision.outcome,
      transitionTarget: transitionSelection.target,
      transitionHandlingMode: transitionSelection.handlingMode,
      orchestrationTarget: transitionOrchestrationDecision.target,
      orchestrationHandlingMode: transitionOrchestrationDecision.handlingMode,
      directiveOutcome: executionDirective.directive,
      handlingActionOutcome: handlingAction.handlingAction,
      ...(executionRouting?.resumeRecordKey
        ? { resumeRecordKey: executionRouting.resumeRecordKey }
        : {})
    },
    allowedInternalUse: launcherCurrentMatterLifecycleConsumptionAllowedInternalUse,
    forbiddenConversions: launcherCurrentMatterLifecycleConsumptionForbiddenConversions,
    renderingAuthorized: false,
    uiCopyAuthorized: false,
    statusLabelAuthorized: false,
    ctaAuthorized: false,
    watchpointExpansionAuthorized: false,
    analyticsAdminSupportExportAuthorized: false,
    ...(input.watchpointDiagnosticsSummary
      ? {
          qaDiagnosticsContext: {
            source: "WATCHPOINT_DIAGNOSTICS_INTERNAL_QA_CONTEXT" as const,
            diagnosticsPassed: input.watchpointDiagnosticsSummary.passed,
            findingsCount: input.watchpointDiagnosticsSummary.findings.length,
            observedEventTypes: [...input.watchpointDiagnosticsSummary.observedEventTypes],
            observedLifecycleRouteKinds: [
              ...input.watchpointDiagnosticsSummary.observedLifecycleRouteKinds
            ],
            sinkCaptureParity: input.watchpointDiagnosticsSummary.sinkCaptureParity
          }
        }
      : {})
  };
}
