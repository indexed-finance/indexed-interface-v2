import type { DailyPoolSnapshot } from "indexed-types";

export type SnapshotKey = keyof Omit<DailyPoolSnapshot, "date">;

export type NormalizedDailySnapshot = DailyPoolSnapshot;
