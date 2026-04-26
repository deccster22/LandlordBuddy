import type { Br02ConsumerAssessment } from "./consumer.js";
import type {
  Br02PaymentPlanTimingBranchCode,
  Br02RuntimeBridgeAssessment
} from "./runtimeBridge.js";

export interface Br02RuntimeBridgeThreadingDecision {
  downstreamInputs: {
    br02ConsumerAssessment: Br02ConsumerAssessment;
    br02RuntimeBridge?: Br02RuntimeBridgeAssessment;
  };
  runtimeBridgeThreaded: boolean;
  paymentPlanConservativeSignoffRequired: boolean;
  paymentPlanConservativeSignoffAccepted: boolean;
  summary: string;
}

export interface DeriveBr02RuntimeBridgeThreadingDecisionInput {
  consumerAssessment: Br02ConsumerAssessment;
  runtimeBridge: Br02RuntimeBridgeAssessment;
  paymentPlanConservativeSignoffAccepted?: boolean;
}

export function deriveBr02RuntimeBridgeThreadingDecision(
  input: DeriveBr02RuntimeBridgeThreadingDecisionInput
): Br02RuntimeBridgeThreadingDecision {
  const paymentPlanBranchCode = input.runtimeBridge.paymentPlanTiming.result.branchCode;
  const paymentPlanConservativeSignoffRequired = (
    paymentPlanBranchCode === "PAYMENT_PLAN_MINIMUM_WINDOW_PENDING"
    || paymentPlanBranchCode === "PAYMENT_PLAN_REVIEW_REQUIRED"
  );
  const paymentPlanConservativeSignoffAccepted = (
    paymentPlanConservativeSignoffRequired
    && input.paymentPlanConservativeSignoffAccepted === true
  );
  const runtimeBridgeThreaded = !paymentPlanConservativeSignoffRequired
    || paymentPlanConservativeSignoffAccepted;

  return {
    downstreamInputs: {
      br02ConsumerAssessment: input.consumerAssessment,
      ...(runtimeBridgeThreaded
        ? { br02RuntimeBridge: input.runtimeBridge }
        : {})
    },
    runtimeBridgeThreaded,
    paymentPlanConservativeSignoffRequired,
    paymentPlanConservativeSignoffAccepted,
    summary: buildThreadingSummary({
      paymentPlanBranchCode,
      paymentPlanConservativeSignoffRequired,
      paymentPlanConservativeSignoffAccepted,
      runtimeBridgeThreaded
    })
  };
}

function buildThreadingSummary(input: {
  paymentPlanBranchCode: Br02PaymentPlanTimingBranchCode;
  paymentPlanConservativeSignoffRequired: boolean;
  paymentPlanConservativeSignoffAccepted: boolean;
  runtimeBridgeThreaded: boolean;
}): string {
  if (!input.paymentPlanConservativeSignoffRequired) {
    return "Runtime bridge is threaded with consumer parity preserved; payment-plan branch is not in a conservative-review posture.";
  }

  if (input.paymentPlanConservativeSignoffAccepted && input.runtimeBridgeThreaded) {
    return (
      "Runtime bridge conservative payment-plan posture is explicitly sign-off accepted for this call site."
    );
  }

  return (
    "Runtime bridge is withheld for this call site because payment-plan posture is conservative and product sign-off was not accepted."
  );
}
