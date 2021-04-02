import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { multicall } from "ethereum";
import type { SelectedBatch } from "features";

export type MulticallData = {
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

export const fetchMulticallData = createAsyncThunk(
  "multicall/fetchData",
  async ({
    provider,
    batch,
  }: {
    provider:
      | ethers.providers.Web3Provider
      | ethers.providers.JsonRpcProvider
      | ethers.providers.InfuraProvider;
    batch: SelectedBatch;
  }): Promise<MulticallData> => {
    const { blockNumber, results } = await multicall(
      provider,
      batch.onChainCalls.deserializedCalls
    );
    const formattedMulticallData = formatMulticallData(
      batch,
      blockNumber,
      results
    );

    return formattedMulticallData;
  }
);

// #region Helpers
export function formatMulticallData(
  batch: SelectedBatch,
  blockNumber: number,
  results: ethers.utils.Result[]
) {
  const { callers, onChainCalls } = batch;
  const { registrars, callsByRegistrant } = onChainCalls;
  const callsToResults = registrars.reduce((prev, next) => {
    prev[next] = [];
    return prev;
  }, {} as Record<string, string[]>);

  let previousCutoff = 0;
  for (const registrar of registrars) {
    const callCount = callsByRegistrant[registrar].length;
    const relevantResults = results.slice(
      previousCutoff,
      previousCutoff + callCount
    );

    let index = 0;
    for (const callResult of relevantResults) {
      const call = callsByRegistrant[registrar][index];
      const formattedResults = callResult.map((bn) =>
        bn.toString()
      ) as string[];

      callsToResults[call].push(...formattedResults);

      index++;
    }

    previousCutoff += callCount;
  }

  return {
    blockNumber,
    callers,
    callsToResults,
  };
}
// #endregion
