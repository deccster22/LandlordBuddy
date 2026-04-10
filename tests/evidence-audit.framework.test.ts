import test from "node:test";
import assert from "node:assert/strict";

import {
  createAuditEvent,
  createInMemoryAuditRecorder
} from "../src/modules/audit/index.js";
import {
  createEvidenceItemShell,
  createInMemoryEvidenceStore,
  validateLocalEvidenceUpload
} from "../src/modules/evidence/index.js";

test("evidence item shell holds file, proof, privacy, retention, upload, and lifecycle hooks", () => {
  const item = createEvidenceItemShell({
    id: "evidence-1",
    matterId: "matter-1",
    kind: "NOTICE",
    title: "Notice to vacate draft",
    fileName: "notice-to-vacate-draft.pdf",
    mimeType: "application/pdf",
    sizeBytes: 2048,
    sourceReferenceIds: ["source-1"],
    attachmentSeparationStatus: "SEPARATE",
    proofOfSendingStatus: "NOT_APPLICABLE",
    privacyClass: "PERSONAL",
    retentionClass: "ARREARS_MVP_WORKING",
    holdStatus: "REVIEW_REQUIRED",
    sourceSensitivity: "PERSONAL"
  });

  assert.equal(item.file.originalFileName, "notice-to-vacate-draft.pdf");
  assert.equal(item.attachmentSeparationStatus, "SEPARATE");
  assert.equal(item.proofOfSendingLink.status, "NOT_APPLICABLE");
  assert.equal(item.privacyClass, "PERSONAL");
  assert.equal(item.retentionClass, "ARREARS_MVP_WORKING");
  assert.equal(item.holdStatus, "REVIEW_REQUIRED");
  assert.equal(item.uploadStatus, "LOCAL_VALIDATION_READY");
  assert.equal(item.privacyHooks.lifecycleState, "REVIEW_NEEDED");
  assert.ok(item.privacyHooks.guardedInsertionPoints.length >= 3);
  assert.deepEqual(item.auditEventIds, []);
});

test("local evidence validation blocks unsupported types and oversized files", () => {
  const result = validateLocalEvidenceUpload({
    id: "evidence-2",
    matterId: "matter-1",
    kind: "COMMUNICATION",
    title: "Bad upload",
    fileName: "scan.exe",
    mimeType: "application/x-msdownload",
    sizeBytes: 30 * 1024 * 1024,
    sourceReferenceIds: []
  });

  assert.equal(result.acceptedLocally, false);
  assert.equal(result.uploadStatus, "LOCAL_VALIDATION_BLOCKED");
  assert.ok(result.issues.some((issue) => issue.code === "UNSUPPORTED_FILE_TYPE"));
  assert.ok(result.issues.some((issue) => issue.code === "INVALID_FILE_SIZE"));
});

test("service proof validation keeps filename, attachment, and proof-linkage review visible", () => {
  const result = validateLocalEvidenceUpload({
    id: "evidence-3",
    matterId: "matter-1",
    kind: "SERVICE_PROOF",
    title: "Service proof",
    fileName: "scan.pdf",
    mimeType: "application/pdf",
    sizeBytes: 1200,
    sourceReferenceIds: [],
    attachmentSeparationStatus: "COMBINED"
  });

  assert.equal(result.acceptedLocally, true);
  assert.equal(result.reviewRequired, true);
  assert.ok(result.issues.some((issue) => issue.code === "UNCLEAR_FILE_NAME"));
  assert.ok(result.issues.some((issue) => issue.code === "ATTACHMENT_SEPARATION_REVIEW"));
  assert.ok(result.issues.some((issue) => issue.code === "PROOF_LINKAGE_REVIEW"));
});

test("evidence store and audit recorder retain evidence-related events without implying official acceptance", () => {
  const store = createInMemoryEvidenceStore();
  const recorder = createInMemoryAuditRecorder();
  const item = createEvidenceItemShell({
    id: "evidence-4",
    matterId: "matter-2",
    kind: "LEDGER",
    title: "Rent ledger",
    fileName: "rent-ledger-april.csv",
    mimeType: "text/csv",
    sizeBytes: 1024,
    sourceReferenceIds: []
  });
  const event = recorder.record({
    id: "audit-1",
    at: "2026-04-02T10:00:00.000Z",
    actor: "system",
    actorType: "SYSTEM",
    matterId: "matter-2",
    domain: "EVIDENCE",
    action: "LOCAL_UPLOAD_VALIDATED",
    severity: "INFO",
    outcome: "RECORDED",
    subjectType: "EVIDENCE_ITEM",
    subjectId: item.id,
    metadata: {
      uploadStatus: item.uploadStatus,
      retentionClass: item.retentionClass,
      privacyClass: item.privacyClass
    }
  });

  store.put({
    ...item,
    auditEventIds: [event.id]
  });

  assert.equal(createAuditEvent({
    id: "audit-2",
    at: "2026-04-02T11:00:00.000Z",
    actor: "operator",
    actorType: "OPERATOR",
    matterId: "matter-2",
    domain: "EVIDENCE",
    action: "REVIEW_REQUESTED",
    severity: "WARNING",
    outcome: "REVIEW_REQUIRED",
    subjectType: "EVIDENCE_ITEM",
    subjectId: item.id,
    metadata: {
      uploadStatus: "EXTERNAL_STATUS_UNCONFIRMED"
    }
  }).event, "EVIDENCE:REVIEW_REQUESTED");
  assert.equal(store.listByMatter("matter-2")[0]?.auditEventIds[0], "audit-1");
  assert.equal(recorder.listByMatter("matter-2")[0]?.event, "EVIDENCE:LOCAL_UPLOAD_VALIDATED");
});
