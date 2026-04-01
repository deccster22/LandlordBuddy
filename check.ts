import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  GUARDED_INSERTION_POINTS,
  createForumPathState,
  createOfficialHandoffStateRecord,
  createOutputModeState,
  officialHandoffStates,
  outputModes,
  validateMatterSeparation,
  type Matter
} from "./src/domain/model.js";

const matter: Matter = {
  id: "matter-1",
  tenancyId: "tenancy-1",
  propertyId: "property-1",
  status: "NOTICE_PREPARATION",
  workflowState: "NOTICE_DRAFTING_READY",
  forumPath: createForumPathState({
    path: "VIC_VCAT_RENT_ARREARS"
  }),
  outputMode: createOutputModeState("PRINTABLE_OUTPUT"),
  officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
  arrearsStatus: {
    asAt: "2026-04-02T10:00:00Z",
    outstandingAmount: { amountMinor: 125000, currency: "AUD" },
    overdueChargeIds: ["charge-1"],
    unappliedPaymentIds: [],
    calculationConfidence: "DETERMINISTIC",
    warnings: []
  },
  priorNoticeIds: [],
  evidenceItemIds: [],
  paymentPlanIds: [],
  referralFlagIds: [],
  routingDecisionIds: [],
  auditLogIds: [],
  sourceReferenceIds: []
};

assert.deepEqual(validateMatterSeparation(matter), []);
assert.ok(outputModes.includes(matter.outputMode.mode));
assert.ok(officialHandoffStates.includes(matter.officialHandoff.stage));

const workflowModuleSource = readFileSync(
  new URL("./src/workflow/arrearsHeroWorkflow.ts", import.meta.url),
  "utf8"
);

assert.ok(workflowModuleSource.includes('"NOTICE_READY_FOR_REVIEW"'));
assert.ok(!workflowModuleSource.includes('"FILED"'));
assert.ok(Object.keys(GUARDED_INSERTION_POINTS).length >= 5);
assert.ok(workflowModuleSource.includes('"MIXED_CLAIM_GUARDED"'));

console.log("Arrears MVP spine checks passed.");
