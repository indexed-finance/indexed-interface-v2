import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { convert } from "helpers";
import { poolUserDataLoaded } from "features/actions";
import { tokensSelectors } from "features/tokens";
import type { AppState } from "features/store";
import type { NormalizedUser } from "ethereum/types";

const initialState: NormalizedUser & {
  recentPoolUpdates: Record<string, number>;
} = {
  address: "",
  allowances: {},
  balances: {},
  recentPoolUpdates: {},
};

const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    userAddressSelected(state, action: PayloadAction<string>) {
      state.address = action.payload;
    },
    userDisconnected() {
      return initialState;
    },
  },
  extraReducers: (builder) =>
    builder.addCase(poolUserDataLoaded, (state, action) => {
      const { blockNumber, poolId, userData } = action.payload;

      for (const tokenId of Object.keys(userData)) {
        const { allowance, balance } = userData[tokenId];
        const combinedId = `${poolId}-${tokenId}`;

        state.allowances[combinedId] = allowance;
        state.balances[tokenId] = balance;
      }

      state.recentPoolUpdates[poolId] = blockNumber;
    }),
});

export const { actions } = slice;

export const selectors = {
  selectUserAddress(state: AppState) {
    return state.user.address;
  },
  selectPoolAllowance(state: AppState, poolId: string, tokenId: string) {
    return state.user.allowances[`${poolId}-${tokenId}`] ?? "0";
  },
  selectTokenBalance(state: AppState, tokenId: string) {
    return state.user.balances[tokenId] ?? "0";
  },
  selectApprovalStatus(
    state: AppState,
    poolId: string,
    tokenSymbol: string,
    amount: string
  ) {
    const tokenLookup = tokensSelectors.selectTokenLookupBySymbol(state);
    const { id: tokenId } = tokenLookup[tokenSymbol];
    const allowance = selectors.selectPoolAllowance(state, poolId, tokenId);
    const needsApproval = convert
      .toBigNumber(amount)
      .isGreaterThan(convert.toBigNumber(allowance));

    return needsApproval;
  },
  selectTokenSymbolsToBalances(state: AppState) {
    const tokenLookup = tokensSelectors.selectTokenLookup(state);

    return Object.entries(tokenLookup).reduce((prev, [key, value]) => {
      if (value) {
        prev[value.symbol] = convert.toBalance(
          selectors.selectTokenBalance(state, key)
        );
      }

      return prev;
    }, {} as Record<string, string>);
  },
};

export default slice.reducer;
