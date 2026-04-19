import type { ControlSeverity, MatterStatus, WorkflowState } from "../domain/model.js";
import {
  resolveBr01Routing,
  type Br01RoutingOutcomeFamily,
  type Br01RoutingResult,
  type ResolveBr01RoutingInput
} from "../modules/br01/index.js";
import type { Br02ConsumerAssessment } from "../modules/br02/consumer.js";
import {
  deriveBr02DownstreamAssessment,
  type Br02DownstreamAssessment
} from "../modules/br02/downstream.js";

export interface WorkflowGuardrail {
  code: string;
  severity: ControlSeverity;
  description: string;
  deterministic: boolean;
}

export interface WorkflowNode {
  state: WorkflowState;
  matterStatus: MatterStatus;
  label: string;
  description: string;
  deterministicEntryCriteria: string[];
  guardedInsertionPoints: string[];
  nextStates: WorkflowState[];
}

export const arrearsHeroWorkflow: WorkflowNode[] = [
  {
    state: "INTAKE_OPEN",
    matterStatus: "INTAKE",
    label: "Intake open",
    description: "Matter has been created and baseline tenancy, party, and ledger inputs are being gathered.",
    deterministicEntryCriteria: [
      "Property, tenancy, and at least one tenant party record exist.",
      "Matter has not progressed into routing or notice preparation."
    ],
    guardedInsertionPoints: [
      "If source materials are incomplete or contradictory, move to INTAKE_INCOMPLETE."
    ],
    nextStates: ["INTAKE_INCOMPLETE", "TRIAGE_READY"]
  },
  {
    state: "INTAKE_INCOMPLETE",
    matterStatus: "INTAKE",
    label: "Intake incomplete",
    description: "A controlled pause state for missing documents, unclear facts, or privacy-handling gaps.",
    deterministicEntryCriteria: [
      "A required source reference or key fact is missing."
    ],
    guardedInsertionPoints: [
      "Privacy engine details remain guarded and should trigger slowdown, not silent continuation."
    ],
    nextStates: ["TRIAGE_READY", "STOPPED_PENDING_EXTERNAL_INPUT"]
  },
  {
    state: "TRIAGE_READY",
    matterStatus: "TRIAGE",
    label: "Triage ready",
    description: "Basic inputs exist to classify the matter into the arrears MVP path without deciding unsettled doctrine.",
    deterministicEntryCriteria: [
      "Tenancy and ledger records support an arrears-oriented matter.",
      "No filing or live portal behavior is attempted."
    ],
    guardedInsertionPoints: [
      "Mixed-claim signals must branch into referral or slowdown, not final routing logic."
    ],
    nextStates: ["TRIAGE_SLOWDOWN", "ARREARS_FACTS_READY", "REFER_OUT"]
  },
  {
    state: "TRIAGE_SLOWDOWN",
    matterStatus: "TRIAGE",
    label: "Triage slowdown",
    description: "A non-terminal pause used when the matter appears in-scope but blocked assumptions need human review.",
    deterministicEntryCriteria: [
      "At least one guarded issue has been identified and logged."
    ],
    guardedInsertionPoints: [
      "Hand-service proof standard and evidence timing remain unresolved.",
      "Portal-specific behaviors remain handoff-only and must not be implemented here."
    ],
    nextStates: ["ARREARS_FACTS_GUARDED", "REFER_OUT", "STOPPED_PENDING_EXTERNAL_INPUT"]
  },
  {
    state: "ARREARS_FACTS_READY",
    matterStatus: "ARREARS_REVIEW",
    label: "Arrears facts ready",
    description: "Deterministic arrears calculations and source-linked fact capture are ready for notice-preparation gating.",
    deterministicEntryCriteria: [
      "Outstanding amount is backed by rent charges and payment records.",
      "Arrears status is marked deterministic or explicitly provisional with warnings."
    ],
    guardedInsertionPoints: [
      "Do not encode final evidence deadline doctrine.",
      "Do not treat prior notice sufficiency as settled unless clearly evidenced."
    ],
    nextStates: ["ARREARS_FACTS_GUARDED", "NOTICE_DRAFTING_READY", "REFER_OUT"]
  },
  {
    state: "ARREARS_FACTS_GUARDED",
    matterStatus: "ARREARS_REVIEW",
    label: "Arrears facts guarded",
    description: "Facts are mostly assembled, but unresolved doctrine requires warnings, slowdown, or referral before drafting.",
    deterministicEntryCriteria: [
      "Matter has an arrears basis but at least one guarded assumption remains active."
    ],
    guardedInsertionPoints: [
      "Mixed-claim logic remains guarded.",
      "Service proof sufficiency remains guarded."
    ],
    nextStates: ["NOTICE_DRAFTING_GUARDED", "REFER_OUT", "STOPPED_PENDING_EXTERNAL_INPUT"]
  },
  {
    state: "NOTICE_DRAFTING_READY",
    matterStatus: "NOTICE_PREPARATION",
    label: "Notice drafting ready",
    description: "The system may assemble a draft package for review without implying final wording or live official submission.",
    deterministicEntryCriteria: [
      "Forum path, output mode, and official handoff state are explicitly separated.",
      "A reviewable notice draft can be prepared from captured facts."
    ],
    guardedInsertionPoints: [
      "Final legal wording remains unresolved and must stay operator-reviewable."
    ],
    nextStates: ["NOTICE_DRAFTING_GUARDED", "NOTICE_READY_FOR_REVIEW", "REFER_OUT"]
  },
  {
    state: "NOTICE_DRAFTING_GUARDED",
    matterStatus: "NOTICE_PREPARATION",
    label: "Notice drafting guarded",
    description: "Drafting is partially possible, but the package must carry warnings or referral flags before readiness.",
    deterministicEntryCriteria: [
      "Drafting inputs exist, but unresolved issues remain attached to the draft."
    ],
    guardedInsertionPoints: [
      "No final wording, filing behavior, or portal mimicry is permitted."
    ],
    nextStates: ["NOTICE_READY_FOR_REVIEW", "REFER_OUT", "STOPPED_PENDING_EXTERNAL_INPUT"]
  },
  {
    state: "NOTICE_READY_FOR_REVIEW",
    matterStatus: "NOTICE_READY",
    label: "Notice ready for review",
    description: "The arrears-to-notice-readiness MVP terminus. Internal package is assembled for human review or external handoff.",
    deterministicEntryCriteria: [
      "Notice draft and evidence package exist in reviewable form.",
      "Official handoff remains a separate state dimension from workflow readiness."
    ],
    guardedInsertionPoints: [
      "Stop before filing, tribunal execution, or authenticated official-system use."
    ],
    nextStates: ["REFER_OUT", "STOPPED_PENDING_EXTERNAL_INPUT"]
  },
  {
    state: "REFER_OUT",
    matterStatus: "REFERRED",
    label: "Refer out",
    description: "Use when the matter exceeds settled MVP scope or requires specialist review.",
    deterministicEntryCriteria: [
      "A referral flag or guarded issue has reached referral severity."
    ],
    guardedInsertionPoints: [],
    nextStates: []
  },
  {
    state: "STOPPED_PENDING_EXTERNAL_INPUT",
    matterStatus: "STOPPED",
    label: "Stopped pending external input",
    description: "Controlled halt used when the workflow cannot safely proceed without external clarification or operator action.",
    deterministicEntryCriteria: [
      "A required dependency is missing or blocked."
    ],
    guardedInsertionPoints: [],
    nextStates: []
  }
];

export const workflowGuardrails: WorkflowGuardrail[] = [
  {
    code: "MIXED_CLAIM_GUARDED",
    severity: "REFERRAL",
    description: "Mixed-claim routing matrix is intentionally deferred and must not be finalized here.",
    deterministic: false
  },
  {
    code: "EVIDENCE_TIMING_GUARDED",
    severity: "SLOWDOWN",
    description: "Evidence timing doctrine is unresolved and should be surfaced as a caution.",
    deterministic: false
  },
  {
    code: "HAND_SERVICE_STANDARD_GUARDED",
    severity: "SLOWDOWN",
    description: "Hand-service proof sufficiency must remain operator-reviewed.",
    deterministic: false
  },
  {
    code: "PORTAL_HANDOFF_ONLY",
    severity: "WARNING",
    description: "Authenticated portal behaviors are modeled only as official handoff states.",
    deterministic: true
  }
];

export function findWorkflowNode(state: WorkflowState): WorkflowNode | undefined {
  return arrearsHeroWorkflow.find((node) => node.state === state);
}

export const br01WorkflowTransitionFamilies = [
  "CONTINUE",
  "GUARDED_REVIEW",
  "SPLIT_MATTER",
  "REFERRAL_STOP",
  "ROUTE_OUT_STOP"
] as const;

export type Br01WorkflowTransitionFamily =
  (typeof br01WorkflowTransitionFamilies)[number];

export const br01WorkflowInsertionPointCodes = [
  "BR01_DETERMINISTIC_CONTINUE",
  "BR01_GUARDED_REVIEW",
  "BR01_SPLIT_MATTER_REQUIRED",
  "BR01_REFERRAL_STOP",
  "BR01_ROUTE_OUT_STOP"
] as const;

export type Br01WorkflowInsertionPointCode =
  (typeof br01WorkflowInsertionPointCodes)[number];

interface Br01WorkflowInsertionPoint {
  code: Br01WorkflowInsertionPointCode;
  transitionFamily: Br01WorkflowTransitionFamily;
  workflowState: WorkflowState;
}

export interface Br01WorkflowTransition {
  routingResult: Br01RoutingResult;
  fromWorkflowState: WorkflowState;
  workflowState: WorkflowState;
  insertionPointCode: Br01WorkflowInsertionPointCode;
  transitionFamily: Br01WorkflowTransitionFamily;
  continueProgression: boolean;
  stopProgression: boolean;
  requiresGuardedReview: boolean;
  requiresSplitMatter: boolean;
  requiresReferralStop: boolean;
  requiresRouteOutStop: boolean;
}

export interface DeriveBr01WorkflowTransitionInput
  extends ResolveBr01RoutingInput {
  fromWorkflowState?: WorkflowState;
}

const br01WorkflowInsertionPointByOutcomeFamily: Record<
  Br01RoutingOutcomeFamily,
  Br01WorkflowInsertionPoint
> = {
  DETERMINISTIC_ROUTE_ALLOWED: {
    code: "BR01_DETERMINISTIC_CONTINUE",
    transitionFamily: "CONTINUE",
    workflowState: "ARREARS_FACTS_READY"
  },
  SLOWDOWN_REVIEW_REQUIRED: {
    code: "BR01_GUARDED_REVIEW",
    transitionFamily: "GUARDED_REVIEW",
    workflowState: "TRIAGE_SLOWDOWN"
  },
  SPLIT_MATTER_REQUIRED: {
    code: "BR01_SPLIT_MATTER_REQUIRED",
    transitionFamily: "SPLIT_MATTER",
    workflowState: "ARREARS_FACTS_GUARDED"
  },
  REFERRAL_REQUIRED: {
    code: "BR01_REFERRAL_STOP",
    transitionFamily: "REFERRAL_STOP",
    workflowState: "REFER_OUT"
  },
  ROUTE_OUT_REQUIRED: {
    code: "BR01_ROUTE_OUT_STOP",
    transitionFamily: "ROUTE_OUT_STOP",
    workflowState: "STOPPED_PENDING_EXTERNAL_INPUT"
  }
};

export function deriveBr01WorkflowTransition(
  input: DeriveBr01WorkflowTransitionInput
): Br01WorkflowTransition {
  const routingResult = resolveBr01Routing(input);
  const insertionPoint = resolveBr01WorkflowInsertionPoint(
    routingResult.outcomeFamily
  );
  const transitionFamily = insertionPoint.transitionFamily;

  return {
    routingResult,
    fromWorkflowState: input.fromWorkflowState ?? "TRIAGE_READY",
    workflowState: insertionPoint.workflowState,
    insertionPointCode: insertionPoint.code,
    transitionFamily,
    continueProgression: transitionFamily === "CONTINUE",
    stopProgression: transitionFamily === "REFERRAL_STOP"
      || transitionFamily === "ROUTE_OUT_STOP",
    requiresGuardedReview: transitionFamily === "GUARDED_REVIEW",
    requiresSplitMatter: transitionFamily === "SPLIT_MATTER",
    requiresReferralStop: transitionFamily === "REFERRAL_STOP",
    requiresRouteOutStop: transitionFamily === "ROUTE_OUT_STOP"
  };
}

export interface Br01WorkflowGate {
  routingResult: Br01RoutingResult;
  workflowTransition: Br01WorkflowTransition;
  workflowState: WorkflowState;
  insertionPointCode: Br01WorkflowInsertionPointCode;
  transitionFamily: Br01WorkflowTransitionFamily;
  progressionStopped: boolean;
  readyForArrearsFacts: boolean;
  triageSlowdown: boolean;
  guardedReviewRequired: boolean;
  splitMatterRequired: boolean;
  referralStop: boolean;
  routeOutStop: boolean;
  referralRequired: boolean;
  routeOutRequired: boolean;
}

export function deriveBr01WorkflowGate(
  input: ResolveBr01RoutingInput
): Br01WorkflowGate {
  const workflowTransition = deriveBr01WorkflowTransition(input);
  const { routingResult } = workflowTransition;
  const workflowState = workflowTransition.workflowState;

  return {
    routingResult,
    workflowTransition,
    workflowState,
    insertionPointCode: workflowTransition.insertionPointCode,
    transitionFamily: workflowTransition.transitionFamily,
    progressionStopped: workflowTransition.stopProgression,
    readyForArrearsFacts: workflowTransition.continueProgression,
    triageSlowdown: workflowState === "TRIAGE_SLOWDOWN",
    guardedReviewRequired: workflowTransition.requiresGuardedReview,
    splitMatterRequired: workflowTransition.requiresSplitMatter,
    referralStop: workflowTransition.requiresReferralStop,
    routeOutStop: workflowTransition.requiresRouteOutStop,
    referralRequired: routingResult.flags.referralRequired,
    routeOutRequired: routingResult.flags.routeOutRequired
  };
}

export interface Br02WorkflowGate {
  status: Br02DownstreamAssessment["status"];
  readinessOutcome: Br02DownstreamAssessment["readinessOutcome"];
  workflowState: WorkflowState;
  readyForProgression: boolean;
  hardStop: boolean;
  needsReview: boolean;
  reviewLedCaution: boolean;
  nextStepReady: boolean;
  issueCodes: string[];
}

export function deriveBr02WorkflowGate(input: {
  consumerAssessment: Br02ConsumerAssessment;
}): Br02WorkflowGate {
  const downstreamAssessment = deriveBr02DownstreamAssessment({
    consumerAssessment: input.consumerAssessment
  });

  return {
    status: downstreamAssessment.status,
    readinessOutcome: downstreamAssessment.readinessOutcome,
    workflowState: downstreamAssessment.workflowState,
    readyForProgression: downstreamAssessment.readyForProgression,
    hardStop: downstreamAssessment.hardStop,
    needsReview: downstreamAssessment.needsReview,
    reviewLedCaution: downstreamAssessment.reviewLedCaution,
    nextStepReady: downstreamAssessment.nextStepReady,
    issueCodes: downstreamAssessment.issueCodes
  };
}

function resolveBr01WorkflowInsertionPoint(
  outcomeFamily: Br01RoutingOutcomeFamily
): Br01WorkflowInsertionPoint {
  return br01WorkflowInsertionPointByOutcomeFamily[outcomeFamily];
}
