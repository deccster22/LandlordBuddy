import type { ArrearsStatus, DateTimeString, ISODate, Money, PaymentRecord, RentCharge } from "../../domain/model.js";

export const arrearsThresholdStates = [
  "BELOW_THRESHOLD",
  "THRESHOLD_MET",
  "BLOCKED_INVALID"
] as const;

export type ArrearsThresholdStateKind = (typeof arrearsThresholdStates)[number];

export interface ArrearsThresholdRule {
  version: string;
  minimumDaysOverdue: number;
  minimumOutstandingAmount: Money;
}

export interface ThresholdState {
  kind: ArrearsThresholdStateKind;
  isEligible: boolean;
  reasons: string[];
}

export interface ArrearsCalculationShell extends ArrearsStatus {
  paidToDate?: ISODate;
  thresholdState: ThresholdState;
  ruleVersion: string;
  thresholdMoment?: DateTimeString;
}

export interface ArrearsCalculationInput {
  charges: RentCharge[];
  payments: PaymentRecord[];
  thresholdRule?: ArrearsThresholdRule;
  asAt: DateTimeString;
}

interface OutstandingChargeBalance {
  chargeId: string;
  dueDate: ISODate;
  unpaidAmountMinor: number;
}

interface RemainingPaymentBalance {
  paymentId: string;
  remainingAmountMinor: number;
}

export function calculateArrearsStatusShell(input: ArrearsCalculationInput): ArrearsCalculationShell {
  const validationIssues = validateArrearsCalculationInput(input);
  const currency = inferCurrency(input);

  if (validationIssues.length > 0 || !currency || !input.thresholdRule) {
    return {
      asAt: input.asAt,
      outstandingAmount: { amountMinor: 0, currency: currency ?? "AUD" },
      overdueChargeIds: [],
      unappliedPaymentIds: [],
      daysInArrears: 0,
      calculationConfidence: "PROVISIONAL",
      warnings: validationIssues,
      thresholdState: {
        kind: "BLOCKED_INVALID",
        isEligible: false,
        reasons: validationIssues.length > 0 ? validationIssues : ["Threshold rule is required."]
      },
      ruleVersion: input.thresholdRule?.version ?? "UNSPECIFIED"
    };
  }

  const dueCharges = [...input.charges]
    .filter((charge) => charge.dueDate <= input.asAt.slice(0, 10))
    .sort(compareIsoDate);
  const receivedPayments = [...input.payments]
    .filter((payment) => payment.receivedAt <= input.asAt)
    .sort((left, right) => left.receivedAt.localeCompare(right.receivedAt));

  const remainingPayments: RemainingPaymentBalance[] = receivedPayments.map((payment) => ({
    paymentId: payment.id,
    remainingAmountMinor: payment.amount.amountMinor
  }));

  const outstandingCharges: OutstandingChargeBalance[] = [];
  let paidToDate: ISODate | undefined;

  for (const charge of dueCharges) {
    let unpaidAmountMinor = charge.amount.amountMinor;

    for (const payment of remainingPayments) {
      if (unpaidAmountMinor === 0) {
        break;
      }

      if (payment.remainingAmountMinor === 0) {
        continue;
      }

      const appliedAmountMinor = Math.min(unpaidAmountMinor, payment.remainingAmountMinor);
      unpaidAmountMinor -= appliedAmountMinor;
      payment.remainingAmountMinor -= appliedAmountMinor;
    }

    if (unpaidAmountMinor === 0) {
      paidToDate = charge.periodEndDate;
      continue;
    }

    outstandingCharges.push({
      chargeId: charge.id,
      dueDate: charge.dueDate,
      unpaidAmountMinor
    });
  }

  const outstandingAmountMinor = outstandingCharges.reduce(
    (sum, charge) => sum + charge.unpaidAmountMinor,
    0
  );
  const overdueChargeIds = outstandingCharges.map((charge) => charge.chargeId);
  const unappliedPaymentIds = remainingPayments
    .filter((payment) => payment.remainingAmountMinor > 0)
    .map((payment) => payment.paymentId);

  const oldestOutstandingCharge = outstandingCharges[0];
  const daysInArrears = oldestOutstandingCharge
    ? diffInCalendarDays(oldestOutstandingCharge.dueDate, input.asAt)
    : 0;

  const thresholdState = buildThresholdState({
    amountOverdue: { amountMinor: outstandingAmountMinor, currency },
    daysOverdue: daysInArrears,
    thresholdRule: input.thresholdRule
  });
  const thresholdMoment = computeThresholdMoment(outstandingCharges, input.thresholdRule, thresholdState);

  return {
    asAt: input.asAt,
    outstandingAmount: {
      amountMinor: outstandingAmountMinor,
      currency
    },
    overdueChargeIds,
    unappliedPaymentIds,
    daysInArrears,
    calculationConfidence: "DETERMINISTIC",
    warnings: [],
    thresholdState,
    ruleVersion: input.thresholdRule.version,
    ...(paidToDate ? { paidToDate } : {}),
    ...(thresholdMoment ? { thresholdMoment } : {})
  };
}

export function buildThresholdState(input: {
  amountOverdue: Money;
  daysOverdue: number;
  thresholdRule?: ArrearsThresholdRule;
}): ThresholdState {
  if (!input.thresholdRule) {
    return {
      kind: "BLOCKED_INVALID",
      isEligible: false,
      reasons: ["Threshold rule is required."]
    };
  }

  if (input.amountOverdue.currency !== input.thresholdRule.minimumOutstandingAmount.currency) {
    return {
      kind: "BLOCKED_INVALID",
      isEligible: false,
      reasons: ["Outstanding amount currency must match threshold rule currency."]
    };
  }

  const reasons: string[] = [];

  if (input.daysOverdue < input.thresholdRule.minimumDaysOverdue) {
    reasons.push("Days overdue threshold not yet met.");
  }

  if (input.amountOverdue.amountMinor < input.thresholdRule.minimumOutstandingAmount.amountMinor) {
    reasons.push("Outstanding amount threshold not yet met.");
  }

  if (reasons.length > 0) {
    return {
      kind: "BELOW_THRESHOLD",
      isEligible: false,
      reasons
    };
  }

  return {
    kind: "THRESHOLD_MET",
    isEligible: true,
    reasons: []
  };
}

export function validateArrearsCalculationInput(input: ArrearsCalculationInput): string[] {
  const issues: string[] = [];

  if (input.charges.length === 0) {
    issues.push("At least one rent charge is required to calculate arrears.");
  }

  if (!input.thresholdRule) {
    issues.push("Threshold rule is required to calculate threshold state.");
  }

  if (!isValidDateTime(input.asAt)) {
    issues.push("Calculation timestamp must be a valid ISO date-time.");
  }

  const currencies = new Set<string>();
  const tenancyIds = new Set<string>();

  for (const charge of input.charges) {
    currencies.add(charge.amount.currency);
    tenancyIds.add(charge.tenancyId);
  }

  for (const payment of input.payments) {
    currencies.add(payment.amount.currency);
    tenancyIds.add(payment.tenancyId);
  }

  if (input.thresholdRule) {
    currencies.add(input.thresholdRule.minimumOutstandingAmount.currency);

    if (input.thresholdRule.minimumDaysOverdue < 0) {
      issues.push("Threshold days must be zero or greater.");
    }

    if (input.thresholdRule.minimumOutstandingAmount.amountMinor < 0) {
      issues.push("Threshold amount must be zero or greater.");
    }
  }

  if (currencies.size > 1) {
    issues.push("Charges, payments, and threshold rule must share a currency.");
  }

  if (tenancyIds.size > 1) {
    issues.push("Charges and payments must belong to a single tenancy.");
  }

  return issues;
}

function inferCurrency(input: ArrearsCalculationInput): Money["currency"] | undefined {
  return input.charges[0]?.amount.currency
    ?? input.payments[0]?.amount.currency
    ?? input.thresholdRule?.minimumOutstandingAmount.currency;
}

function computeThresholdMoment(
  outstandingCharges: OutstandingChargeBalance[],
  thresholdRule: ArrearsThresholdRule,
  thresholdState: ThresholdState
): DateTimeString | undefined {
  if (thresholdState.kind !== "THRESHOLD_MET") {
    return undefined;
  }

  const oldestOutstandingCharge = outstandingCharges[0];

  if (!oldestOutstandingCharge) {
    return undefined;
  }

  const amountThresholdDate = findAmountThresholdDate(outstandingCharges, thresholdRule.minimumOutstandingAmount.amountMinor);
  const daysThresholdDate = addDays(oldestOutstandingCharge.dueDate, thresholdRule.minimumDaysOverdue);

  return amountThresholdDate > daysThresholdDate ? amountThresholdDate : daysThresholdDate;
}

function findAmountThresholdDate(
  outstandingCharges: OutstandingChargeBalance[],
  minimumOutstandingAmountMinor: number
): DateTimeString {
  let runningOutstandingAmountMinor = 0;

  for (const charge of outstandingCharges) {
    runningOutstandingAmountMinor += charge.unpaidAmountMinor;

    if (runningOutstandingAmountMinor >= minimumOutstandingAmountMinor) {
      return toStartOfDayDateTime(charge.dueDate);
    }
  }

  return toStartOfDayDateTime(outstandingCharges[0]?.dueDate ?? new Date().toISOString().slice(0, 10));
}

function compareIsoDate(left: RentCharge, right: RentCharge): number {
  return left.dueDate.localeCompare(right.dueDate);
}

function diffInCalendarDays(fromIsoDate: ISODate, toDateTime: DateTimeString): number {
  const start = Date.parse(`${fromIsoDate}T00:00:00.000Z`);
  const end = Date.parse(toDateTime);

  return Math.max(Math.floor((end - start) / (24 * 60 * 60 * 1000)), 0);
}

function addDays(isoDate: ISODate, dayCount: number): DateTimeString {
  const next = new Date(`${isoDate}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + dayCount);
  return next.toISOString();
}

function toStartOfDayDateTime(isoDate: ISODate): DateTimeString {
  return new Date(`${isoDate}T00:00:00.000Z`).toISOString();
}

function isValidDateTime(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}
