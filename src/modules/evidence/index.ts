import type {
  AttachmentSeparationStatus,
  ControlSeverity,
  EvidenceHoldStatus,
  EvidenceItem,
  EvidencePrivacyClass,
  EvidenceRetentionClass,
  EvidenceUploadStatus,
  EvidenceValidationFlag,
  ProofOfSendingStatus,
  SourceSensitivity
} from "../../domain/model.js";

export interface EvidenceUploadCandidate {
  id: string;
  matterId: string;
  kind: EvidenceItem["kind"];
  title: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  sourceReferenceIds: string[];
  storageLocator?: string;
  attachmentSeparationStatus?: AttachmentSeparationStatus;
  proofOfSendingStatus?: ProofOfSendingStatus;
  proofOfSendingLinkedEvidenceItemIds?: string[];
  proofOfSendingNotes?: string;
  privacyClass?: EvidencePrivacyClass;
  retentionClass?: EvidenceRetentionClass;
  holdStatus?: EvidenceHoldStatus;
  uploadStatus?: EvidenceUploadStatus;
  sourceSensitivity?: SourceSensitivity;
}

export interface UploadValidationRules {
  allowedMimeTypes: readonly string[];
  maxSizeBytes: number;
  genericFileNameTokens: readonly string[];
  minimumFileStemLength: number;
}

export interface UploadValidationIssue {
  code: string;
  field: "fileType" | "fileSize" | "filenameClarity" | "attachmentSeparation" | "proofOfSendingLinkage";
  severity: ControlSeverity;
  message: string;
  deterministic: boolean;
  blockedLocally: boolean;
  guardedInsertionPoint?: string;
}

export interface UploadValidationResult {
  acceptedLocally: boolean;
  reviewRequired: boolean;
  uploadStatus: EvidenceUploadStatus;
  normalizedFileName: string;
  issues: UploadValidationIssue[];
}

export interface EvidenceStore {
  put(item: EvidenceItem): EvidenceItem;
  getById(id: string): EvidenceItem | undefined;
  listByMatter(matterId: string): EvidenceItem[];
}

export interface UploadValidator {
  validate(input: EvidenceUploadCandidate, rules?: UploadValidationRules): UploadValidationResult;
}

export const defaultUploadValidationRules: UploadValidationRules = {
  allowedMimeTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "message/rfc822",
    "text/csv",
    "text/plain"
  ],
  maxSizeBytes: 25 * 1024 * 1024,
  genericFileNameTokens: ["scan", "image", "document", "file", "upload"],
  minimumFileStemLength: 6
};

export function validateLocalEvidenceUpload(
  input: EvidenceUploadCandidate,
  rules: UploadValidationRules = defaultUploadValidationRules
): UploadValidationResult {
  const issues: UploadValidationIssue[] = [];
  const normalizedFileName = normalizeFileName(input.fileName);

  if (!rules.allowedMimeTypes.includes(input.mimeType)) {
    issues.push({
      code: "UNSUPPORTED_FILE_TYPE",
      field: "fileType",
      severity: "SLOWDOWN",
      message: "Unsupported local file type for the current evidence shell.",
      deterministic: true,
      blockedLocally: true
    });
  }

  if (input.sizeBytes <= 0 || input.sizeBytes > rules.maxSizeBytes) {
    issues.push({
      code: "INVALID_FILE_SIZE",
      field: "fileSize",
      severity: "SLOWDOWN",
      message: "File size falls outside the current local upload limits.",
      deterministic: true,
      blockedLocally: true
    });
  }

  if (!isFileNameClear(normalizedFileName, rules)) {
    issues.push({
      code: "UNCLEAR_FILE_NAME",
      field: "filenameClarity",
      severity: "WARNING",
      message: "Filename clarity should be improved so the evidence pack stays reviewable.",
      deterministic: true,
      blockedLocally: false
    });
  }

  const attachmentSeparationStatus = input.attachmentSeparationStatus ?? "UNKNOWN";

  if (attachmentSeparationStatus !== "SEPARATE") {
    issues.push({
      code: "ATTACHMENT_SEPARATION_REVIEW",
      field: "attachmentSeparation",
      severity: "WARNING",
      message: "Attachment separation should remain visible for review instead of being silently assumed.",
      deterministic: true,
      blockedLocally: false
    });
  }

  const proofOfSendingStatus = input.proofOfSendingStatus
    ?? (input.kind === "SERVICE_PROOF" ? "REVIEW_REQUIRED" : "NOT_APPLICABLE");
  const proofLinkedEvidence = input.proofOfSendingLinkedEvidenceItemIds ?? [];

  if (input.kind === "SERVICE_PROOF" && (proofOfSendingStatus !== "LINKED" || proofLinkedEvidence.length === 0)) {
    issues.push({
      code: "PROOF_LINKAGE_REVIEW",
      field: "proofOfSendingLinkage",
      severity: "WARNING",
      message: "Proof-of-sending linkage remains a visible placeholder and requires review.",
      deterministic: false,
      blockedLocally: false,
      guardedInsertionPoint: "handServiceProof"
    });
  }

  const acceptedLocally = !issues.some((issue) => issue.blockedLocally);
  const reviewRequired = issues.some((issue) => !issue.blockedLocally);

  return {
    acceptedLocally,
    reviewRequired,
    uploadStatus: acceptedLocally ? "LOCAL_VALIDATION_READY" : "LOCAL_VALIDATION_BLOCKED",
    normalizedFileName,
    issues
  };
}

export function createEvidenceItemShell(
  input: EvidenceUploadCandidate,
  rules: UploadValidationRules = defaultUploadValidationRules
): EvidenceItem {
  const validation = validateLocalEvidenceUpload(input, rules);
  const proofOfSendingStatus = input.proofOfSendingStatus
    ?? (input.kind === "SERVICE_PROOF" ? "REVIEW_REQUIRED" : "NOT_APPLICABLE");
  const attachmentSeparationStatus = input.attachmentSeparationStatus ?? "UNKNOWN";
  const extension = extractExtension(input.fileName);
  const validationFlags = validation.issues.map<EvidenceValidationFlag>((issue) => ({
    code: issue.code,
    kind: toValidationFlagKind(issue.field),
    severity: issue.severity,
    summary: issue.message,
    deterministic: issue.deterministic
  }));
  const relevance = validation.acceptedLocally
    ? defaultRelevanceForKind(input.kind)
    : "GUARDED";

  return {
    id: input.id,
    matterId: input.matterId,
    kind: input.kind,
    title: input.title,
    ...(input.storageLocator ? { storageLocator: input.storageLocator } : {}),
    relevance,
    file: {
      originalFileName: input.fileName,
      normalizedFileName: validation.normalizedFileName,
      mediaType: input.mimeType,
      ...(extension ? { extension } : {}),
      sizeBytes: input.sizeBytes
    },
    attachmentSeparationStatus,
    proofOfSendingLink: {
      status: proofOfSendingStatus,
      relatedEvidenceItemIds: input.proofOfSendingLinkedEvidenceItemIds ?? [],
      ...(input.proofOfSendingNotes ? { notes: input.proofOfSendingNotes } : {})
    },
    privacyClass: input.privacyClass ?? "TENANCY_OPERATIONAL",
    retentionClass: input.retentionClass ?? "UNCLASSIFIED_PENDING_POLICY",
    holdStatus: input.holdStatus ?? "NONE",
    uploadStatus: input.uploadStatus ?? validation.uploadStatus,
    sourceSensitivity: input.sourceSensitivity ?? "LOW",
    validationFlags,
    auditEventIds: [],
    sourceReferenceIds: input.sourceReferenceIds
  };
}

export function createInMemoryEvidenceStore(initial: EvidenceItem[] = []): EvidenceStore {
  const byId = new Map(initial.map((item) => [item.id, item]));

  return {
    put(item) {
      byId.set(item.id, item);
      return item;
    },
    getById(id) {
      return byId.get(id);
    },
    listByMatter(matterId) {
      return [...byId.values()].filter((item) => item.matterId === matterId);
    }
  };
}

function normalizeFileName(fileName: string): string {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/\s+/gu, "-")
    .replace(/[^a-z0-9._-]/gu, "");
}

function isFileNameClear(fileName: string, rules: UploadValidationRules): boolean {
  const stem = fileName.replace(/\.[^.]+$/u, "");

  if (stem.length < rules.minimumFileStemLength) {
    return false;
  }

  return !rules.genericFileNameTokens.includes(stem);
}

function extractExtension(fileName: string): string | undefined {
  const extension = /\.([^.]+)$/u.exec(fileName)?.[1];
  return extension ? `.${extension.toLowerCase()}` : undefined;
}

function defaultRelevanceForKind(kind: EvidenceItem["kind"]): EvidenceItem["relevance"] {
  if (kind === "LEDGER" || kind === "NOTICE" || kind === "SERVICE_PROOF") {
    return "CORE";
  }

  return "SUPPORTING";
}

function toValidationFlagKind(
  field: UploadValidationIssue["field"]
): EvidenceValidationFlag["kind"] {
  switch (field) {
    case "fileType":
      return "FILE_TYPE";
    case "fileSize":
      return "FILE_SIZE";
    case "filenameClarity":
      return "FILENAME_CLARITY";
    case "attachmentSeparation":
      return "ATTACHMENT_SEPARATION";
    case "proofOfSendingLinkage":
      return "PROOF_LINKAGE";
  }
}
