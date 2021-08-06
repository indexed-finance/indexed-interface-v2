import {
  TokenAdapter,
  TokenData,
  VaultSnapshot,
} from "@indexed-finance/subgraph-clients/dist/nirn/types";
import { convert, createMulticallDataParser } from "helpers";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { fetchMulticallData } from "../batcher/requests"; // Circular dependency.
import { fetchVaultsData } from "../requests";
import { mirroredServerState, restartedDueToError } from "../actions";
import type { AppState } from "../store";

export type NormalizedTokenAdapter = TokenAdapter & {
  revenueTokens?: string[];
  revenueAPRs?: string[];
};

export interface NormalizedVault {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  totalValue?: string;
  totalSupply?: string;
  price?: string;
  netAPR?: string;
  totalFeesClaimed: string;
  underlying: TokenData;
  feeRecipient: string;
  rewardsSeller: string;
  performanceFee: number;
  reserveRatio: number;
  adapters: NormalizedTokenAdapter[];
  weights: number[];
  snapshots: VaultSnapshot[];

  balances?: string[];
  reserveBalance?: string;
  averagePricePerShare?: number;
}

export const VAULTS_CALLER = "Vaults";

const adapter = createEntityAdapter<NormalizedVault>({
  selectId: (entry) => entry.id.toLowerCase(),
});

const slice = createSlice({
  name: "vaults",
  initialState: adapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchMulticallData.fulfilled, (state, action) => {
        const relevantMulticallData = vaultsMulticallDataParser(action.payload);

        if (relevantMulticallData) {
          const { revenueBreakdowns, vaultUpdates } = relevantMulticallData;

          console.log({ vaultUpdates });

          for (const [vault, update] of Object.entries(vaultUpdates)) {
            const entry = state.entities[vault];
            if (entry) {
              console.log(`Found vault with queried update - ${entry.symbol}`);
              if (update.totalSupply) entry.totalSupply = update.totalSupply;
              if (update.netAPR) entry.netAPR = update.netAPR;
              if (update.price) entry.price = update.price;
              if (update.totalValue) entry.totalValue = update.totalValue;
              if (update.balances) entry.balances = update.balances;
              if (update.reserveBalance)
                entry.reserveBalance = update.reserveBalance;
            }
          }
          for (const [adapter, breakdown] of Object.entries(
            revenueBreakdowns
          )) {
            const vaultID = Object.values(state.entities).find((entity) =>
              entity?.adapters.find((a) => a.id === adapter)
            )?.id;
            if (!vaultID) continue;
            console.log(`Found vault with queried adapter - ${vaultID}`);
            const vault = state.entities[vaultID];
            if (vault) {
              const entry = vault.adapters.find(
                (a) => a.id === adapter
              ) as NormalizedTokenAdapter;
              entry.revenueTokens = breakdown.tokens;
              entry.revenueAPRs = breakdown.aprs;
            }
          }
        }
      })
      .addCase(mirroredServerState, (_, action) => action.payload.vaults)
      .addCase(restartedDueToError, () => adapter.getInitialState())
      .addCase(fetchVaultsData.fulfilled, (state, action) => {
        const vaults = action.payload ?? [];
        for (const { price, ...vault } of vaults) {
          const entry = state.entities[vault.id.toLowerCase()]
          if (!entry) {
            adapter.upsertOne(state, vault)
          } else {
            entry.feeRecipient = vault.feeRecipient
            entry.rewardsSeller = vault.rewardsSeller
            entry.performanceFee = vault.performanceFee
            entry.reserveRatio = vault.reserveRatio
            entry.snapshots = vault.snapshots
            entry.weights = vault.weights
            entry.averagePricePerShare = vault.averagePricePerShare
            if (entry.weights.some((w, i) => vault.weights[i] !== w)) {
              entry.weights = vault.weights
            }
            if (entry.adapters.some((a, i) => vault.adapters[i].id !== a.id)) {
              for (const {...adapter} of vault.adapters as NormalizedTokenAdapter[]) {
                const existingAdapter = entry.adapters.find(a => a.id === adapter.id);
                if (existingAdapter) {
                  adapter.revenueAPRs = existingAdapter.revenueAPRs
                  adapter.revenueTokens = existingAdapter.revenueTokens
                }
              }
              entry.adapters = vault.adapters
            }
          }
        }
      }),
});

export const { actions: vaultsActions, reducer: vaultsReducer } = slice;

const selectors = adapter.getSelectors((state: AppState) => state.vaults);

export const vaultsSelectors = {
  selectAllVaults(state: AppState) {
    return selectors.selectAll(state);
  },
  selectVault(state: AppState, id: string) {
    const vault = selectors.selectById(state, id);

    return vault ?? null;
  },
  selectVaultAPR(state: AppState, id: string) {
    const vault = selectors.selectById(state, id);
    if (!vault) return 0;
    let netAPR = 0;
    for (let i = 0; i < vault.adapters.length; i++) {
      const adapter = vault.adapters[i];
      const revenueAPR =
        adapter.revenueAPRs?.reduce(
          (t, n) => t + convert.toBalanceNumber(n),
          0
        ) ?? 0;
      netAPR += revenueAPR * vault.weights[i];
    }
    netAPR *= 1 - vault.reserveRatio;
    return +(netAPR * 100).toFixed(2);
  },
  selectVaultTargetReserveBalance(state: AppState, id: string) {
    const vault = selectors.selectById(state, id);

    if (vault?.totalValue) {
      return convert.toBigNumber(vault.totalValue).times(vault.reserveRatio);
    } else {
      return 0;
    }
  },
  selectProtocolTargetBalances(state: AppState, id: string) {
    const vault = selectors.selectById(state, id);

    if (vault) {
      const { balances = [], weights, reserveRatio } = vault;

      return weights.map((weight, i) => {
        const balance = balances[i] ?? "0";

        return convert
          .toBigNumber(balance)
          .times(1 - reserveRatio)
          .times(weight);
      });
    } else {
      return [];
    }
  },
  selectNeedsToRebalance(state: AppState, id: string) {
    const vault = selectors.selectById(state, id);

    if (vault?.totalValue && vault?.reserveBalance) {
      const vaultBalance = convert
        .toBigNumber(vault.totalValue)
        .times(vault.reserveRatio);
      const needsToAtTopLevel = vaultBalance
        .minus(vault.reserveBalance)
        .abs()
        .dividedBy(vaultBalance)
        .isGreaterThanOrEqualTo(0.1);

      if (needsToAtTopLevel) {
        return true;
      } else {
        if (vault.balances) {
          for (let i = 0; i < vault.adapters.length; i++) {
            const balance = vault.balances[i];
            const weight = vault.weights[i];
            const value = convert
              .toBigNumber(vault.totalValue)
              .times(1 - vault.reserveRatio)
              .times(weight);
            const difference = value
              .abs()
              .dividedBy(convert.toBigNumber(balance));

            if (difference.isGreaterThanOrEqualTo(0.1)) {
              return true;
            }
          }
        }
      }
    }

    return false;
  },
};

type RevenueBreakdown = {
  tokens: string[];
  aprs: string[];
};

type VaultUpdate = {
  netAPR?: string;
  price?: string;
  totalValue?: string;
  totalSupply?: string;
  balances?: string[];
  reserveBalance?: string;
};

type NormalizedVaultsUpdate = {
  vaultUpdates: Record<string, VaultUpdate>;
  revenueBreakdowns: Record<string, RevenueBreakdown>;
};

// #region Helpers
const vaultsMulticallDataParser = createMulticallDataParser(
  VAULTS_CALLER,
  (calls): NormalizedVaultsUpdate => {
    const vaultUpdates: Record<string, VaultUpdate> = {};
    const revenueBreakdowns: Record<string, RevenueBreakdown> = {};

    calls.forEach(([target, resultsByFunction]) => {
      target = target.toLowerCase();
      const functionsCalled = Object.keys(resultsByFunction);
      functionsCalled.forEach((functionCalled) => {
        const result = resultsByFunction[functionCalled][0].result;
        if (!result) return;
        switch (functionCalled) {
          case "getPricePerFullShareWithFee":
            vaultUpdates[target] = {
              ...(vaultUpdates[target] || {}),
              price: result[0],
            };
            break;
          case "balance":
            vaultUpdates[target] = {
              ...(vaultUpdates[target] || {}),
              totalValue: result[0],
            };
            break;
          case "totalSupply":
            vaultUpdates[target] = {
              ...(vaultUpdates[target] || {}),
              totalSupply: result[0],
            };
            break;
          case "getBalances":
            vaultUpdates[target].balances = result;

            break;
          case "reserveBalance":
            vaultUpdates[target].reserveBalance = result[0];

            break;
          case "getRevenueBreakdown":
            const tokens = result[0].split(",");
            const aprs = result[1].split(",");
            revenueBreakdowns[target] = {
              tokens,
              aprs,
            };
            break;
        }
      });
    });
    return { vaultUpdates, revenueBreakdowns };
  }
);
