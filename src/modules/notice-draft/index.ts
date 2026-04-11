import type {
  DateTimeString,
  EntityId,
  NoticeDraft,
  PrivacyLifecycleHooks
} from "../../domain/model.js";
import type {
  ForumPathState,
  OutputModeState
} from "../../domain/preparation.js";
import {
  buildBr04PrivacyHooksFromSource,
  type Br04PolicySource
} from "../br04/index.js";

export interface NoticeDraftPrivacyHookSourceInput {
  source?: Br04PolicySource | undefined;
  policyKeys?: readonly string[] | undefined;
  accessScopeIds?: readonly EntityId[] | undefined;
  hookOverrides?: Partial<PrivacyLifecycleHooks> | undefined;
}

export interface CreateNoticeDraftRecordInput {
  id: EntityId;
  matterId: EntityId;
  version: number;
  forumPath: ForumPathState;
  outputMode: OutputModeState;
  preparedAt?: DateTimeString;
  draftStatus?: NoticeDraft["draftStatus"];
  unresolvedIssueIds?: EntityId[];
  sourceReferenceIds?: EntityId[];
}

export function createNoticeDraftRecord(
  input: CreateNoticeDraftRecordInput,
  privacyHookInput: NoticeDraftPrivacyHookSourceInput = {}
): NoticeDraft {
  const draftStatus = input.draftStatus ?? "NOT_STARTED";

  return {
    id: input.id,
    matterId: input.matterId,
    version: input.version,
    ...(input.preparedAt ? { preparedAt: input.preparedAt } : {}),
    draftStatus,
    forumPath: input.forumPath,
    outputMode: input.outputMode,
    unresolvedIssueIds: input.unresolvedIssueIds ?? [],
    privacyHooks: buildBr04PrivacyHooksFromSource({
      appliesTo: "NOTICE_DRAFT",
      source: privacyHookInput.source,
      policyKeys: privacyHookInput.policyKeys,
      accessScopeIds: privacyHookInput.accessScopeIds,
      hookOverrides: {
        lifecycleState: deriveNoticeDraftPrivacyLifecycleState(draftStatus),
        ...(privacyHookInput.hookOverrides ?? {})
      }
    }),
    sourceReferenceIds: input.sourceReferenceIds ?? []
  };
}

function deriveNoticeDraftPrivacyLifecycleState(
  _draftStatus: NoticeDraft["draftStatus"]
): PrivacyLifecycleHooks["lifecycleState"] {
  return "REVIEW_NEEDED";
}
