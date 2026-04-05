export const br02QaInventoryAreas = [
  "DATE_RULE",
  "SERVICE_METHOD",
  "CONSENT_PROOF",
  "EVIDENCE_TIMING",
  "FRESHNESS",
  "AUDIT"
] as const;

export type Br02QaInventoryArea = (typeof br02QaInventoryAreas)[number];

export interface Br02QaInventoryHook {
  id: string;
  area: Br02QaInventoryArea;
  deterministic: boolean;
  invariant: string;
  registryCodes: readonly string[];
  testFiles: readonly string[];
}

export const br02QaInventoryHooks: readonly Br02QaInventoryHook[] = Object.freeze([
  {
    id: "BR02-NO-EARLY-NOTICE",
    area: "DATE_RULE",
    deterministic: true,
    invariant: "No-early-notice gate remains explicit and threshold-driven before service/timing handling proceeds.",
    registryCodes: ["NO_EARLY_NOTICE_THRESHOLD_GATE", "NO_EARLY_NOTICE_GATE"],
    testFiles: ["tests/br02-registry-scaffold.test.ts"]
  },
  {
    id: "BR02-SERVICE-METHODS",
    area: "SERVICE_METHOD",
    deterministic: true,
    invariant: "Service methods remain distinct in the registry rather than collapsing registered post, email, and hand delivery into one path.",
    registryCodes: ["REGISTERED_POST_SERVICE_DATE", "EMAIL_SERVICE_WITH_CONSENT", "HAND_SERVICE_REVIEW_ONLY"],
    testFiles: ["tests/br02-registry-scaffold.test.ts"]
  },
  {
    id: "BR02-EMAIL-CONSENT",
    area: "CONSENT_PROOF",
    deterministic: true,
    invariant: "Email service requires linked consent proof, and consent proof remains reusable per renter and scope variation.",
    registryCodes: ["EMAIL_SERVICE_WITH_CONSENT", "EMAIL_CONSENT_PROOF_REQUIRED"],
    testFiles: ["tests/br02-registry-scaffold.test.ts"]
  },
  {
    id: "BR02-REGISTERED-POST",
    area: "SERVICE_METHOD",
    deterministic: true,
    invariant: "Registered post remains the preferred deterministic postal path without flattening all postal timing into one truth.",
    registryCodes: ["REGISTERED_POST_SERVICE_DATE", "REGISTERED_POST_PREFERRED_PATH", "REGISTERED_POST_ASSUMPTION_MONITOR"],
    testFiles: ["tests/br02-registry-scaffold.test.ts"]
  },
  {
    id: "BR02-HAND-SERVICE-GUARDED",
    area: "SERVICE_METHOD",
    deterministic: false,
    invariant: "Hand service stays guarded and never becomes auto-sufficient in scaffold form.",
    registryCodes: ["HAND_SERVICE_REVIEW_ONLY", "HAND_SERVICE_REVIEW_REQUIRED"],
    testFiles: ["tests/br02-registry-scaffold.test.ts"]
  },
  {
    id: "BR02-EVIDENCE-TIMING",
    area: "EVIDENCE_TIMING",
    deterministic: true,
    invariant: "Evidence timing remains dual-step plus override, and hearing-specific instructions outrank generic timing surfaces.",
    registryCodes: ["SERVICE_EVENT_BASELINE_CAPTURE", "EVIDENCE_PREP_REQUIRED_7_DAY_STEP", "HEARING_SPECIFIC_OVERRIDE_PRIORITY"],
    testFiles: ["tests/br02-registry-scaffold.test.ts"]
  },
  {
    id: "BR02-STALE-STATE",
    area: "FRESHNESS",
    deterministic: false,
    invariant: "Freshness and stale-state posture stays structural and never collapses into universal deadline truth.",
    registryCodes: ["GENERIC_EVIDENCE_TIMING_MONITOR", "HEARING_SPECIFIC_OVERRIDE_MONITOR", "STALE_GENERIC_TIMING_SURFACE"],
    testFiles: ["tests/br02-registry-scaffold.test.ts"]
  },
  {
    id: "BR02-AUDIT-SHAPE",
    area: "AUDIT",
    deterministic: true,
    invariant: "BR02 audit events preserve subject, severity, outcome, rule linkage, and timing freshness metadata without implying official acceptance.",
    registryCodes: ["NO_EARLY_NOTICE_GATE", "EVIDENCE_PREP_REQUIRED_7_DAY_STEP"],
    testFiles: ["tests/br02-registry-scaffold.test.ts"]
  }
]);
