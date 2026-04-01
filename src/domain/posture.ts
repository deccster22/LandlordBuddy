export const controlSeverities = [
  "INFO",
  "WARNING",
  "SLOWDOWN",
  "REFERRAL"
] as const;

export type ControlSeverity = (typeof controlSeverities)[number];

export const visibleSourceTypes = [
  "STABLE_RULE",
  "OFFICIAL_GUIDANCE",
  "LIVE_PORTAL_OR_FORM_BEHAVIOR",
  "UNRESOLVED_ITEM"
] as const;

export type VisibleSourceType = (typeof visibleSourceTypes)[number];

export interface CarryForwardControl {
  code: string;
  severity: ControlSeverity;
  summary: string;
  visibleSourceType: VisibleSourceType;
  deterministic: boolean;
  guardedInsertionPoint?: string;
  touchpointId?: string;
}

export function mergeCarryForwardControls(
  ...controlSets: readonly CarryForwardControl[][]
): CarryForwardControl[] {
  const merged = new Map<string, CarryForwardControl>();

  for (const controlSet of controlSets) {
    for (const control of controlSet) {
      const key = `${control.code}::${control.touchpointId ?? ""}`;

      if (!merged.has(key)) {
        merged.set(key, control);
      }
    }
  }

  return [...merged.values()];
}
