import test from "node:test";
import assert from "node:assert/strict";

import { GUARDED_INSERTION_POINTS, type PaymentRecord, type RentCharge } from "../src/domain/model.js";
import { buildThresholdState, calculateArrearsStatusShell } from "../src/modules/arrears/index.js";
import {
  buildTimelineEngineShell,
  timelineMilestoneCategories,
  type TimelineMilestone,
  type TimelineMilestoneCategory,
  type TimelineNoticeReadinessInput,
  type TimelineShell
} from "../src/modules/timeline/index.js";
import {
  validateUnpaidRentNoticeReadiness,
  type UnpaidRentNoticeReadinessInput
} from "../src/modules/notice-readiness/index.js";

const charge = (overrides: Partial<RentCharge> = {}): RentCharge => ({
  id: "charge-1",
  tenancyId: "tenancy-1",
  dueDate: "2026-03-10",
  amount: { amountMinor: 125000, currency: "AUD" },
  periodStartDate: "2026-03-03",
  periodEndDate: "2026-03-09",
  sourceReferenceIds: [],
  ...overrides
});

const payment = (overrides: Partial<PaymentRecord> = {}): PaymentRecord => ({
  id: "payment-1",
  tenancyId: "tenancy-1",
  receivedAt: "2026-03-12T09:00:00.000Z",
  amount: { amountMinor: 25000, currency: "AUD" },
  sourceReferenceIds: [],
  ...overrides
});

const thresholdRule = {
  version: "P4A-CX-02-shell-v1",
  minimumDaysOverdue: 14,
  minimumOutstandingAmount: { amountMinor: 100000, currency: "AUD" as const }
};

test("threshold state is below threshold until both amount and day triggers are met", () => {
  const result = buildThresholdState({
    amountOverdue: { amountMinor: 150000, currency: "AUD" },
    daysOverdue: 8,
    thresholdRule
  });

  assert.equal(result.kind, "BELOW_THRESHOLD");
  assert.equal(result.isEligible, false);
  assert.deepEqual(result.reasons, ["Days overdue threshold not yet met."]);
});

test("arrears shell reports blocked_invalid when core inputs are insufficient", () => {
  const result = calculateArrearsStatusShell({
    charges: [],
    payments: [],
    asAt: "2026-04-02T10:00:00.000Z"
  });

  assert.equal(result.thresholdState.kind, "BLOCKED_INVALID");
  assert.equal(result.calculationConfidence, "PROVISIONAL");
  assert.match(result.thresholdState.reasons.join(" "), /threshold rule is required/i);
});

test("arrears shell computes paid-to date, overdue amount, and threshold eligibility", () => {
  const result = calculateArrearsStatusShell({
    charges: [
      charge({ id: "charge-1", dueDate: "2026-03-10", periodEndDate: "2026-03-16" }),
      charge({ id: "charge-2", dueDate: "2026-03-17", periodStartDate: "2026-03-17", periodEndDate: "2026-03-23" })
    ],
    payments: [
      payment({ amount: { amountMinor: 125000, currency: "AUD" }, receivedAt: "2026-03-20T09:00:00.000Z" })
    ],
    thresholdRule,
    asAt: "2026-04-02T10:00:00.000Z"
  });

  assert.equal(result.paidToDate, "2026-03-16");
  assert.equal(result.outstandingAmount.amountMinor, 125000);
  assert.equal(result.daysInArrears, 16);
  assert.equal(result.thresholdState.kind, "THRESHOLD_MET");
  assert.equal(result.thresholdState.isEligible, true);
  assert.equal(result.ruleVersion, thresholdRule.version);
});

test("timeline shell exposes deterministic, guarded, and external milestone posture when threshold is met", () => {
  const arrears = calculateArrearsStatusShell({
    charges: [charge()],
    payments: [],
    thresholdRule,
    asAt: "2026-04-02T10:00:00.000Z"
  });

  const timeline = buildTimelineEngineShell({ arrears });
  const categories = timeline.milestones.map((milestone) => milestone.category);
  const thresholdMilestone = findMilestone(timeline, "ARREARS_THRESHOLD");
  const paymentPlanMilestone = findMilestone(timeline, "PAYMENT_PLAN");
  const evidenceMilestone = findMilestone(timeline, "EVIDENCE");
  const hearingMilestone = findMilestone(timeline, "HEARING");

  assert.deepEqual(categories, [...timelineMilestoneCategories]);
  assert.equal(timeline.noEarlyNoticeGate.canPrepareNotice, true);
  assert.equal(thresholdMilestone.kind, "DETERMINISTIC_MILESTONE");
  assert.equal(thresholdMilestone.status, "ELIGIBLE");
  assert.equal(thresholdMilestone.confidence, "DETERMINISTIC");
  assert.deepEqual(thresholdMilestone.dependsOn, []);
  assert.equal(paymentPlanMilestone.kind, "GUARDED_PLACEHOLDER");
  assert.equal(paymentPlanMilestone.status, "GUARDED");
  assert.equal(paymentPlanMilestone.dependsOn[1]?.status, "GUARDED");
  assert.equal(evidenceMilestone.kind, "GUARDED_PLACEHOLDER");
  assert.equal(evidenceMilestone.status, "GUARDED");
  assert.equal(evidenceMilestone.guardedInsertionPoint, GUARDED_INSERTION_POINTS.evidenceTiming);
  assert.match(evidenceMilestone.notes.join(" "), /no final evidence-deadline sentence/i);
  assert.equal(hearingMilestone.status, "EXTERNAL");
  assert.equal(hearingMilestone.sourceSensitivity, "EXTERNAL_OFFICIAL_INSTRUCTION");
  assert.equal(hearingMilestone.reminderHooks[0]?.status, "EXTERNAL");
  assert.match(hearingMilestone.visibilityReason, /external and handoff-dependent/i);
  assert.match(hearingMilestone.notes.join(" "), /outside the product boundary/i);
});

test("timeline shell blocks downstream milestones until threshold is met", () => {
  const arrears = calculateArrearsStatusShell({
    charges: [charge({ dueDate: "2026-03-27", periodStartDate: "2026-03-20", periodEndDate: "2026-03-26" })],
    payments: [],
    thresholdRule,
    asAt: "2026-04-02T10:00:00.000Z"
  });

  const timeline = buildTimelineEngineShell({ arrears });
  const thresholdMilestone = findMilestone(timeline, "ARREARS_THRESHOLD");
  const noticeMilestone = findMilestone(timeline, "NOTICE");
  const paymentPlanMilestone = findMilestone(timeline, "PAYMENT_PLAN");
  const evidenceMilestone = findMilestone(timeline, "EVIDENCE");
  const hearingMilestone = findMilestone(timeline, "HEARING");

  assert.equal(arrears.thresholdState.kind, "BELOW_THRESHOLD");
  assert.equal(timeline.noEarlyNoticeGate.canPrepareNotice, false);
  assert.match(timeline.noEarlyNoticeGate.reason, /early notice is not available/i);
  assert.equal(thresholdMilestone.status, "PENDING");
  assert.equal(noticeMilestone.kind, "ADVISORY_MILESTONE");
  assert.equal(noticeMilestone.status, "BLOCKED");
  assert.equal(paymentPlanMilestone.kind, "GUARDED_PLACEHOLDER");
  assert.equal(paymentPlanMilestone.status, "BLOCKED");
  assert.equal(paymentPlanMilestone.dependsOn[0]?.status, "PENDING");
  assert.equal(paymentPlanMilestone.reminderHooks[0]?.status, "BLOCKED");
  assert.equal(evidenceMilestone.status, "BLOCKED");
  assert.equal(hearingMilestone.status, "BLOCKED");
  assert.equal(hearingMilestone.dependsOn[2]?.status, "PENDING");
});

test("timeline shell keeps blocked-invalid posture distinct from guarded and external downstream states", () => {
  const arrears = calculateArrearsStatusShell({
    charges: [],
    payments: [],
    asAt: "2026-04-02T10:00:00.000Z"
  });

  const timeline = buildTimelineEngineShell({ arrears });
  const thresholdMilestone = findMilestone(timeline, "ARREARS_THRESHOLD");
  const paymentPlanMilestone = findMilestone(timeline, "PAYMENT_PLAN");
  const evidenceMilestone = findMilestone(timeline, "EVIDENCE");
  const hearingMilestone = findMilestone(timeline, "HEARING");

  assert.equal(arrears.thresholdState.kind, "BLOCKED_INVALID");
  assert.equal(timeline.noEarlyNoticeGate.canPrepareNotice, false);
  assert.match(timeline.noEarlyNoticeGate.reason, /core arrears inputs are insufficient/i);
  assert.equal(thresholdMilestone.status, "BLOCKED");
  assert.match(thresholdMilestone.visibilityReason, /cannot be confirmed/i);
  assert.equal(paymentPlanMilestone.status, "BLOCKED");
  assert.equal(paymentPlanMilestone.dependsOn[0]?.status, "BLOCKED");
  assert.match(paymentPlanMilestone.visibilityReason, /core arrears inputs are insufficient/i);
  assert.equal(evidenceMilestone.status, "BLOCKED");
  assert.equal(hearingMilestone.status, "BLOCKED");
});

test("notice milestone can show readiness-driven progression without implying official completion", () => {
  const arrears = calculateArrearsStatusShell({
    charges: [charge()],
    payments: [],
    thresholdRule,
    asAt: "2026-04-02T10:00:00.000Z"
  });
  const noticeReadiness = toTimelineNoticeReadiness(
    validateUnpaidRentNoticeReadiness(buildBaseReadinessInput())
  );

  const timeline = buildTimelineEngineShell({ arrears, noticeReadiness });
  const noticeMilestone = findMilestone(timeline, "NOTICE");

  assert.equal(noticeMilestone.kind, "ADVISORY_MILESTONE");
  assert.equal(noticeMilestone.status, "ELIGIBLE");
  assert.equal(noticeMilestone.dependsOn[1]?.status, "SATISFIED");
  assert.match(timeline.noEarlyNoticeGate.reason, /still not an official filing step/i);
  assert.match(noticeMilestone.notes.join(" "), /not be read as an official filing step/i);
});

test("review-required notice posture stays distinct from guarded and external downstream milestones", () => {
  const arrears = calculateArrearsStatusShell({
    charges: [charge()],
    payments: [],
    thresholdRule,
    asAt: "2026-04-02T10:00:00.000Z"
  });
  const readinessInput = buildBaseReadinessInput();
  readinessInput.guarded = {
    ...readinessInput.guarded,
    serviceProofSufficiency: "guarded"
  };

  const noticeReadinessResult = validateUnpaidRentNoticeReadiness(readinessInput);
  const timeline = buildTimelineEngineShell({
    arrears,
    noticeReadiness: toTimelineNoticeReadiness(noticeReadinessResult)
  });
  const noticeMilestone = findMilestone(timeline, "NOTICE");
  const paymentPlanMilestone = findMilestone(timeline, "PAYMENT_PLAN");
  const hearingMilestone = findMilestone(timeline, "HEARING");

  assert.equal(noticeReadinessResult.outcome, "REVIEW_REQUIRED");
  assert.equal(noticeMilestone.status, "PENDING");
  assert.equal(noticeMilestone.dependsOn[1]?.status, "GUARDED");
  assert.match(noticeMilestone.visibilityReason, /guarded notice-readiness review/i);
  assert.equal(paymentPlanMilestone.status, "GUARDED");
  assert.equal(hearingMilestone.status, "EXTERNAL");
});

function buildBaseReadinessInput(): UnpaidRentNoticeReadinessInput {
  return {
    arrearsThresholdStatus: "threshold_met",
    arrearsAmount: 1850,
    paidToDate: "2026-03-20",
    noticeNumber: "NTV-204",
    serviceMethod: "EMAIL",
    interstateRouteOut: false,
    guarded: {
      serviceProofSufficiency: "cleared",
      documentaryEvidenceCompleteness: "cleared",
      handServiceReview: "not_applicable",
      mixedClaimRoutingInteraction: "cleared"
    }
  };
}

function toTimelineNoticeReadiness(input: {
  outcome: TimelineNoticeReadinessInput["outcome"];
  readyForProgression: boolean;
}): TimelineNoticeReadinessInput {
  return {
    outcome: input.outcome,
    readyForProgression: input.readyForProgression
  };
}

function findMilestone(
  timeline: TimelineShell,
  category: TimelineMilestoneCategory
): TimelineMilestone {
  const milestone = timeline.milestones.find((candidate) => candidate.category === category);

  assert.ok(milestone, `Expected ${category} milestone to exist.`);

  return milestone;
}
