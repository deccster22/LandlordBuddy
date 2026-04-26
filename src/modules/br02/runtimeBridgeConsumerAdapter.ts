import type {
  Br02ConsumerAssessment,
  Br02ConsumerDisposition
} from "./consumer.js";
import type { Br02ValidationIssue } from "./models.js";
import type {
  Br02RuntimeBridgeAssessment,
  Br02RuntimeBridgeResultKind
} from "./runtimeBridge.js";

type Br02RuntimeBridgeConsumerShape = Pick<
  Br02ConsumerAssessment,
  "disposition"
  | "issues"
  | "hardStops"
  | "warnings"
  | "cautions"
  | "summary"
>;

export interface Br02RuntimeBridgeSegmentKinds {
  noEarlyNoticeGate: Br02RuntimeBridgeResultKind;
  serviceProof: Br02RuntimeBridgeResultKind;
  terminationDate: Br02RuntimeBridgeResultKind;
  evidenceDeadline?: Br02RuntimeBridgeResultKind;
  paymentPlanTiming: Br02RuntimeBridgeResultKind;
}

export interface Br02RuntimeBridgeConsumerAdapterResult
  extends Br02RuntimeBridgeConsumerShape {
  segmentKinds: Br02RuntimeBridgeSegmentKinds;
}

export function adaptBr02RuntimeBridgeToConsumerShape(input: {
  runtimeBridge: Br02RuntimeBridgeAssessment;
}): Br02RuntimeBridgeConsumerAdapterResult {
  const segmentKinds: Br02RuntimeBridgeSegmentKinds = {
    noEarlyNoticeGate: input.runtimeBridge.noEarlyNoticeGate.kind,
    serviceProof: input.runtimeBridge.serviceProof.kind,
    terminationDate: input.runtimeBridge.terminationDate.kind,
    ...(input.runtimeBridge.evidenceDeadline
      ? { evidenceDeadline: input.runtimeBridge.evidenceDeadline.kind }
      : {}),
    paymentPlanTiming: input.runtimeBridge.paymentPlanTiming.kind
  };
  const issues = dedupeIssues([
    ...input.runtimeBridge.noEarlyNoticeGate.result.issues,
    ...input.runtimeBridge.serviceProof.result.issues,
    ...input.runtimeBridge.terminationDate.result.issues,
    ...(input.runtimeBridge.evidenceDeadline?.result.issues ?? []),
    ...input.runtimeBridge.paymentPlanTiming.result.issues
  ]);
  const hardStops = issues.filter((issue) => issue.severity === "hard-stop");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  const cautions = issues.filter((issue) => issue.severity === "slowdown");
  const disposition = deriveBr02RuntimeBridgeConsumerDisposition({
    segmentKinds,
    hardStops,
    warnings,
    cautions
  });

  return {
    disposition,
    issues,
    hardStops,
    warnings,
    cautions,
    summary: input.runtimeBridge.summary,
    segmentKinds
  };
}

function deriveBr02RuntimeBridgeConsumerDisposition(input: {
  segmentKinds: Br02RuntimeBridgeSegmentKinds;
  hardStops: readonly Br02ValidationIssue[];
  warnings: readonly Br02ValidationIssue[];
  cautions: readonly Br02ValidationIssue[];
}): Br02ConsumerDisposition {
  const kinds = [
    input.segmentKinds.noEarlyNoticeGate,
    input.segmentKinds.serviceProof,
    input.segmentKinds.terminationDate,
    ...(input.segmentKinds.evidenceDeadline
      ? [input.segmentKinds.evidenceDeadline]
      : []),
    input.segmentKinds.paymentPlanTiming
  ];

  if (kinds.some((kind) => kind === "HARD_STOP") || input.hardStops.length > 0) {
    return "HARD_STOP";
  }

  if (input.cautions.length > 0) {
    return "REVIEW_LED_CAUTION";
  }

  if (
    kinds.some((kind) => kind === "OVERRIDE_SENSITIVE_RESULT")
    || input.warnings.length > 0
  ) {
    return "NEEDS_REVIEW";
  }

  return "NEXT_STEP_READY";
}

function dedupeIssues(
  issues: readonly Br02ValidationIssue[]
): Br02ValidationIssue[] {
  const seen = new Set<string>();

  return issues.filter((issue) => {
    if (seen.has(issue.code)) {
      return false;
    }

    seen.add(issue.code);
    return true;
  });
}
