import test from "node:test";
import assert from "node:assert/strict";

import type { PaymentRecord, RentCharge } from "../src/domain/model.js";
import { buildThresholdState, calculateArrearsStatusShell } from "../src/modules/arrears/index.js";
import { buildTimelineEngineShell, timelineMilestoneCategories } from "../src/modules/timeline/index.js";

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

test("timeline shell preserves guarded milestone placeholders and notice gate shape", () => {
  const arrears = calculateArrearsStatusShell({
    charges: [charge()],
    payments: [],
    thresholdRule,
    asAt: "2026-04-02T10:00:00.000Z"
  });

  const timeline = buildTimelineEngineShell({ arrears });
  const categories = timeline.milestones.map((milestone) => milestone.category);
  const evidenceMilestone = timeline.milestones.find((milestone) => milestone.category === "EVIDENCE");

  assert.deepEqual(categories, [...timelineMilestoneCategories]);
  assert.equal(timeline.noEarlyNoticeGate.canPrepareNotice, true);
  assert.equal(evidenceMilestone?.kind, "GUARDED_PLACEHOLDER");
  assert.match(evidenceMilestone?.notes.join(" ") ?? "", /no final evidence-deadline sentence/i);
});
