import type { RegisteredCall } from "helpers";

export type SelectedBatch = {
  callers: Record<string, { onChainCalls: string[]; offChainCalls: string[] }>;
  onChainCalls: {
    registrars: string[];
    callsByRegistrant: Record<string, string[]>;
    serializedCalls: string[];
    deserializedCalls: RegisteredCall[];
  };
  offChainCalls: string[];
};

export type NormalizedMulticallData = {
  blockNumber: number;
  callers: Record<
    string,
    {
      onChainCalls: string[];
      offChainCalls: string[];
    }
  >;
  callsToResults: Record<string, string[]>;
};
