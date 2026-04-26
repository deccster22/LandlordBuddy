import type { EntityId } from "../domain/model.js";
import type { Br04LifecycleActionPlan, Br04PolicySource } from "../modules/br04/index.js";
import {
  replayOutputPackageLifecycleOrchestration,
  type OutputPackageLifecycleOrchestrationRecord
} from "./outputPackageLifecycleOrchestration.js";

export interface OutputPackageLifecycleOrchestrationRecordLocator {
  matterId: EntityId;
  outputPackageId: EntityId;
  lifecycleRequestId: EntityId;
}

export interface SaveOutputPackageLifecycleOrchestrationRecordInput {
  key: string;
  record: OutputPackageLifecycleOrchestrationRecord;
}

export interface OutputPackageLifecycleOrchestrationRecordStore {
  save(input: SaveOutputPackageLifecycleOrchestrationRecordInput): void;
  loadByKey(key: string): unknown;
}

export interface StoreOutputPackageLifecycleOrchestrationRecordInput {
  store: OutputPackageLifecycleOrchestrationRecordStore;
  record: OutputPackageLifecycleOrchestrationRecord;
  key?: string | undefined;
}

export interface StoredOutputPackageLifecycleOrchestrationRecord {
  key: string;
  record: OutputPackageLifecycleOrchestrationRecord;
}

export interface LoadOutputPackageLifecycleOrchestrationRecordInput {
  store: OutputPackageLifecycleOrchestrationRecordStore;
  key: string;
}

export interface ReplayStoredOutputPackageLifecycleOrchestrationInput
  extends LoadOutputPackageLifecycleOrchestrationRecordInput {
  source?: Br04PolicySource | undefined;
}

export interface InMemoryOutputPackageLifecycleOrchestrationRecordEntry {
  key: string;
  record: unknown;
}

export function buildOutputPackageLifecycleOrchestrationRecordKey(
  locator: OutputPackageLifecycleOrchestrationRecordLocator
): string {
  return [
    "matter",
    encodeKeyPart(locator.matterId),
    "output",
    encodeKeyPart(locator.outputPackageId),
    "request",
    encodeKeyPart(locator.lifecycleRequestId)
  ].join(":");
}

export function deriveOutputPackageLifecycleOrchestrationRecordKey(
  record: OutputPackageLifecycleOrchestrationRecord
): string {
  return buildOutputPackageLifecycleOrchestrationRecordKey({
    matterId: record.replay.matterId,
    outputPackageId: record.replay.outputPackageId,
    lifecycleRequestId: record.replay.lifecycleRequest.id
  });
}

export function storeOutputPackageLifecycleOrchestrationRecord(
  input: StoreOutputPackageLifecycleOrchestrationRecordInput
): StoredOutputPackageLifecycleOrchestrationRecord {
  const key = input.key ?? deriveOutputPackageLifecycleOrchestrationRecordKey(input.record);
  const record = cloneRecord(input.record);

  input.store.save({
    key,
    record
  });

  return {
    key,
    record
  };
}

export function loadOutputPackageLifecycleOrchestrationRecord(
  input: LoadOutputPackageLifecycleOrchestrationRecordInput
): OutputPackageLifecycleOrchestrationRecord {
  const loadedRecord = input.store.loadByKey(input.key);

  if (loadedRecord === undefined) {
    throw new Error(
      `Missing output-package lifecycle orchestration record for key ${input.key}.`
    );
  }

  assertIsOutputPackageLifecycleOrchestrationRecord(loadedRecord, input.key);

  return cloneRecord(loadedRecord);
}

export function replayStoredOutputPackageLifecycleOrchestration(
  input: ReplayStoredOutputPackageLifecycleOrchestrationInput
): Br04LifecycleActionPlan {
  const orchestrationRecord = loadOutputPackageLifecycleOrchestrationRecord({
    store: input.store,
    key: input.key
  });

  return replayOutputPackageLifecycleOrchestration({
    orchestrationRecord,
    source: input.source
  });
}

export function createInMemoryOutputPackageLifecycleOrchestrationRecordStore(
  initial: readonly InMemoryOutputPackageLifecycleOrchestrationRecordEntry[] = []
): OutputPackageLifecycleOrchestrationRecordStore {
  const byKey = new Map(initial.map((entry) => [entry.key, cloneUnknown(entry.record)]));

  return {
    save(input) {
      byKey.set(input.key, cloneUnknown(input.record));
    },
    loadByKey(key) {
      const record = byKey.get(key);
      return record === undefined ? undefined : cloneUnknown(record);
    }
  };
}

function assertIsOutputPackageLifecycleOrchestrationRecord(
  value: unknown,
  key: string
): asserts value is OutputPackageLifecycleOrchestrationRecord {
  if (!isRecord(value)) {
    throwMalformedRecord(key, "record payload must be an object");
  }

  if (!isNonEmptyString(value.orchestrationVersion)) {
    throwMalformedRecord(key, "orchestrationVersion must be present");
  }

  const outputPackage = value.outputPackage;

  if (!isRecord(outputPackage)) {
    throwMalformedRecord(key, "outputPackage payload must be present");
  }

  if (!isNonEmptyString(outputPackage.id) || !isNonEmptyString(outputPackage.matterId)) {
    throwMalformedRecord(key, "outputPackage id and matterId must be present");
  }

  const runtimeRecord = value.runtimeRecord;

  if (!isRecord(runtimeRecord)) {
    throwMalformedRecord(key, "runtimeRecord payload must be present");
  }

  if (!isNonEmptyString(runtimeRecord.dataClassId)) {
    throwMalformedRecord(key, "runtimeRecord dataClassId must be present");
  }

  if (!isNonEmptyString(runtimeRecord.policyKey)) {
    throwMalformedRecord(key, "runtimeRecord policyKey must be present");
  }

  if (!isStringArray(runtimeRecord.activeHoldFlagIds)) {
    throwMalformedRecord(key, "runtimeRecord activeHoldFlagIds must be a string array");
  }

  if (!isStringArray(runtimeRecord.releasedHoldFlagIds)) {
    throwMalformedRecord(key, "runtimeRecord releasedHoldFlagIds must be a string array");
  }

  const lifecyclePlan = value.lifecyclePlan;

  if (!isRecord(lifecyclePlan)) {
    throwMalformedRecord(key, "lifecyclePlan payload must be present");
  }

  if (!isLifecycleRoute(lifecyclePlan.route)) {
    throwMalformedRecord(
      key,
      "lifecyclePlan route must be DELETION_REQUEST or DEIDENTIFICATION_ACTION"
    );
  }

  if (typeof lifecyclePlan.suppressedByHold !== "boolean") {
    throwMalformedRecord(key, "lifecyclePlan suppressedByHold must be boolean");
  }

  if (!Array.isArray(value.holdCommandResults)) {
    throwMalformedRecord(key, "holdCommandResults must be an array");
  }

  if (!Array.isArray(value.auditEvents)) {
    throwMalformedRecord(key, "auditEvents must be an array");
  }

  for (const event of value.auditEvents) {
    if (!isRecord(event) || !isNonEmptyString(event.event)) {
      throwMalformedRecord(key, "auditEvents entries must include event");
    }

    if (!isStringArray(event.policyKeys)) {
      throwMalformedRecord(key, "auditEvents entries must include policyKeys array");
    }

    if (!isStringArray(event.holdFlagIds)) {
      throwMalformedRecord(key, "auditEvents entries must include holdFlagIds array");
    }

    if (!isStringArray(event.sourceReferenceIds)) {
      throwMalformedRecord(key, "auditEvents entries must include sourceReferenceIds array");
    }
  }

  const replay = value.replay;

  if (!isRecord(replay)) {
    throwMalformedRecord(key, "replay envelope must be present");
  }

  if (!isNonEmptyString(replay.matterId) || !isNonEmptyString(replay.outputPackageId)) {
    throwMalformedRecord(key, "replay envelope must include matterId and outputPackageId");
  }

  if (!isNonEmptyString(replay.dataClassId)) {
    throwMalformedRecord(key, "replay envelope must include dataClassId");
  }

  if (!Array.isArray(replay.holdFlags)) {
    throwMalformedRecord(key, "replay envelope must include holdFlags array");
  }

  if (!isStringArray(replay.releasedHoldFlagIds)) {
    throwMalformedRecord(key, "replay envelope must include releasedHoldFlagIds array");
  }

  for (const holdFlag of replay.holdFlags) {
    if (!isRecord(holdFlag) || !isNonEmptyString(holdFlag.id)) {
      throwMalformedRecord(key, "replay holdFlags entries must include id");
    }
  }

  const lifecycleRequest = replay.lifecycleRequest;

  if (!isRecord(lifecycleRequest)) {
    throwMalformedRecord(key, "replay lifecycleRequest must be present");
  }

  if (!isNonEmptyString(lifecycleRequest.id)) {
    throwMalformedRecord(key, "replay lifecycleRequest id must be present");
  }

  if (!isLifecycleRequestedAction(lifecycleRequest.requestedAction)) {
    throwMalformedRecord(
      key,
      "replay lifecycleRequest requestedAction must be REQUEST_DELETION or REQUEST_DEIDENTIFICATION"
    );
  }

  if (!isNonEmptyString(lifecycleRequest.requestedAt)) {
    throwMalformedRecord(key, "replay lifecycleRequest requestedAt must be present");
  }

  if (!isNonEmptyString(lifecycleRequest.requestedByRole)) {
    throwMalformedRecord(key, "replay lifecycleRequest requestedByRole must be present");
  }
}

function throwMalformedRecord(key: string, detail: string): never {
  throw new Error(
    `Malformed output-package lifecycle orchestration record for key ${key}: ${detail}.`
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isLifecycleRoute(value: unknown): value is "DELETION_REQUEST" | "DEIDENTIFICATION_ACTION" {
  return value === "DELETION_REQUEST" || value === "DEIDENTIFICATION_ACTION";
}

function isLifecycleRequestedAction(
  value: unknown
): value is "REQUEST_DELETION" | "REQUEST_DEIDENTIFICATION" {
  return value === "REQUEST_DELETION" || value === "REQUEST_DEIDENTIFICATION";
}

function encodeKeyPart(value: string): string {
  return encodeURIComponent(value);
}

function cloneRecord(
  record: OutputPackageLifecycleOrchestrationRecord
): OutputPackageLifecycleOrchestrationRecord {
  return cloneUnknown(record) as OutputPackageLifecycleOrchestrationRecord;
}

function cloneUnknown<T>(value: T): T {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}
