import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { multicall } from "ethereum";
import type { NormalizedMulticallData, SelectedBatch } from "./types";

export function normalizeMulticallData(
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

export const fetchMulticallData = createAsyncThunk(
  "batcher/multicall",
  async ({
    provider,
    arg: batch,
  }: {
    provider:
      | ethers.providers.Web3Provider
      | ethers.providers.JsonRpcProvider
      | ethers.providers.InfuraProvider;
    arg: SelectedBatch;
  }): Promise<NormalizedMulticallData> => {
    const { blockNumber, results } = await multicall(
      provider,
      batch.onChainCalls.deserializedCalls
    );
    const formattedMulticallData = normalizeMulticallData(
      batch,
      blockNumber,
      results
    );

    return formattedMulticallData;
  }
);
