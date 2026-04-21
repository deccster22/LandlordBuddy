import test from "node:test";
import assert from "node:assert/strict";

import { createOfficialHandoffStateRecord } from "../src/domain/model.js";
import {
  buildStructuralTrustBinding,
  type StructuralTrustBindingKind,
  type StructuralTrustReadinessOutcome
} from "../src/modules/output/trustBindings.js";

type TrustCueParityReadinessOutcome = Exclude<
  StructuralTrustReadinessOutcome,
  "NOT_EVALUATED"
>;

interface TrustCueParityCase {
  name: string;
  kind: StructuralTrustBindingKind;
  readinessOutcome: TrustCueParityReadinessOutcome;
  surfaceKey: string;
  expectedTrustCueKey: string;
}

const trustCueParityCases: readonly TrustCueParityCase[] = [
  {
    name: "printable readiness summary",
    kind: "PRINTABLE_OUTPUT",
    readinessOutcome: "READY_FOR_REVIEW",
    surfaceKey: "readiness-summary",
    expectedTrustCueKey: "trust-cue.readiness-summary"
  },
  {
    name: "printable blocker summary",
    kind: "PRINTABLE_OUTPUT",
    readinessOutcome: "BLOCKED",
    surfaceKey: "blocker-summary",
    expectedTrustCueKey: "trust-cue.blocker-summary"
  },
  {
    name: "printable guarded review flags",
    kind: "PRINTABLE_OUTPUT",
    readinessOutcome: "REVIEW_REQUIRED",
    surfaceKey: "guarded-review-flags",
    expectedTrustCueKey: "trust-cue.guarded-review-flags"
  },
  {
    name: "printable sequencing blocked",
    kind: "PRINTABLE_OUTPUT",
    readinessOutcome: "BLOCKED",
    surfaceKey: "sequencing-blocked",
    expectedTrustCueKey: "trust-cue.sequencing-blocked"
  },
  {
    name: "prep-pack copy-ready facts",
    kind: "PREP_PACK_COPY_READY",
    readinessOutcome: "READY_FOR_REVIEW",
    surfaceKey: "copy-ready-facts",
    expectedTrustCueKey: "trust-cue.copy-ready-facts-gated"
  },
  {
    name: "prep-pack referral stop",
    kind: "PREP_PACK_COPY_READY",
    readinessOutcome: "REFER_OUT",
    surfaceKey: "referral-stop",
    expectedTrustCueKey: "trust-cue.referral-stop"
  },
  {
    name: "prep-pack live confirmation required",
    kind: "PREP_PACK_COPY_READY",
    readinessOutcome: "REVIEW_REQUIRED",
    surfaceKey: "live-confirmation-required",
    expectedTrustCueKey: "trust-cue.live-confirmation-required"
  },
  {
    name: "prep-pack touchpoint stale",
    kind: "PREP_PACK_COPY_READY",
    readinessOutcome: "REVIEW_REQUIRED",
    surfaceKey: "touchpoint-stale",
    expectedTrustCueKey: "trust-cue.touchpoint-stale"
  },
  {
    name: "prep-pack wrong-channel reroute",
    kind: "PREP_PACK_COPY_READY",
    readinessOutcome: "REFER_OUT",
    surfaceKey: "wrong-channel-reroute",
    expectedTrustCueKey: "trust-cue.wrong-channel-reroute"
  },
  {
    name: "handoff boundary",
    kind: "OFFICIAL_HANDOFF_GUIDANCE",
    readinessOutcome: "READY_FOR_REVIEW",
    surfaceKey: "handoff-boundary",
    expectedTrustCueKey: "trust-cue.boundary-codes-visible"
  },
  {
    name: "handoff external action owner",
    kind: "OFFICIAL_HANDOFF_GUIDANCE",
    readinessOutcome: "READY_FOR_REVIEW",
    surfaceKey: "external-action-owner",
    expectedTrustCueKey: "trust-cue.external-action-owner"
  },
  {
    name: "handoff review before official step",
    kind: "OFFICIAL_HANDOFF_GUIDANCE",
    readinessOutcome: "READY_FOR_REVIEW",
    surfaceKey: "review-before-official-step",
    expectedTrustCueKey: "trust-cue.review-before-official-step"
  },
  {
    name: "handoff authenticated-surface handoff",
    kind: "OFFICIAL_HANDOFF_GUIDANCE",
    readinessOutcome: "REVIEW_REQUIRED",
    surfaceKey: "authenticated-surface-handoff",
    expectedTrustCueKey: "trust-cue.authenticated-surface-handoff-only"
  },
  {
    name: "handoff defer-to-live-official-flow",
    kind: "OFFICIAL_HANDOFF_GUIDANCE",
    readinessOutcome: "REVIEW_REQUIRED",
    surfaceKey: "defer-to-live-official-flow",
    expectedTrustCueKey: "trust-cue.defer-to-live-official-flow"
  }
];

test("trust-cue parity matrix stays explicit across consequential surfaces", () => {
  for (const parityCase of trustCueParityCases) {
    const trustBinding = buildStructuralTrustBinding({
      kind: parityCase.kind,
      officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
      readinessOutcome: parityCase.readinessOutcome,
      ...(parityCase.kind === "PRINTABLE_OUTPUT"
        ? { sectionKeys: [parityCase.surfaceKey] }
        : { blockKeys: [parityCase.surfaceKey] }),
      touchpoints: [],
      carryForwardControls: []
    });
    const surfaceBinding = trustBinding.surfaceBindings.find(
      (binding) => binding.surfaceKey === parityCase.surfaceKey
    );

    assert.ok(surfaceBinding, `${parityCase.name} surface binding should exist`);
    assert.ok(
      (surfaceBinding?.trustCueKeys.length ?? 0) > 0,
      `${parityCase.name} should have at least one trust cue key`
    );
    assert.ok(
      surfaceBinding?.trustCueKeys.includes(parityCase.expectedTrustCueKey),
      `${parityCase.name} should include ${parityCase.expectedTrustCueKey} at surface level`
    );
    assert.ok(
      trustBinding.trustCueKeys.includes(parityCase.expectedTrustCueKey),
      `${parityCase.name} should include ${parityCase.expectedTrustCueKey} at package trust level`
    );
  }
});
