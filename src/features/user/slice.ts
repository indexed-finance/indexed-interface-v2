import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { convert, createMulticallDataParser } from "helpers";
import { multicallDataReceived, poolUserDataLoaded } from "features/actions";
import { tokensSelectors } from "features/tokens";
import type { AppState } from "features/store";
import type { NormalizedUser } from "ethereum/types";

export type ApprovalStatus = "unknown" | "approval needed" | "approved";

const USER_PREFIX = "User Data";

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
    builder
      .addCase(poolUserDataLoaded, (state, action) => {
        const { blockNumber, poolId, userData } = action.payload;

        for (const tokenId of Object.keys(userData)) {
          const { allowance, balance } = userData[tokenId];
          const combinedId = `${poolId}-${tokenId}`.toLowerCase();

          if (allowance) {
            state.allowances[combinedId] = allowance;
          }

          if (balance) {
            state.balances[tokenId] = balance;
          }
        }

        state.recentPoolUpdates[poolId] = blockNumber;
      })
      .addCase(multicallDataReceived, (state, action) => {
        const parsed = userMulticallDataParser(action.payload);

        if (parsed) {
          const { allowances, balances } = parsed;

          state.allowances = allowances;
          state.balances = balances;
        }

        return state;
      }),
});

export const { actions } = slice;

export const selectors = {
  selectUserAddress(state: AppState) {
    return state.user.address;
  },
  selectTokenAllowance(state: AppState, poolId: string, tokenId: string) {
    return state.user.allowances[`${poolId}-${tokenId}`.toLowerCase()];
  },
  selectTokenBalance(state: AppState, tokenId: string) {
    return state.user.balances[tokenId] ?? "0";
  },
  selectApprovalStatus(
    state: AppState,
    spender: string,
    tokenId: string,
    amount: string
  ): ApprovalStatus {
    const entry = tokensSelectors.selectTokenById(state, tokenId);

    if (entry) {
      const allowance = selectors.selectTokenAllowance(state, spender, tokenId);
      if (allowance) {
        const needsApproval = convert
          .toBigNumber(amount)
          .isGreaterThan(convert.toBigNumber(allowance));

        return needsApproval ? "approval needed" : "approved";
      } else {
        return "unknown";
      }
    } else {
      return "unknown";
    }
  },
  selectTokenSymbolsToBalances(state: AppState) {
    const tokenLookup = tokensSelectors.selectTokenLookup(state);

    return Object.entries(tokenLookup).reduce((prev, [key, value]) => {
      if (value) {
        prev[value.symbol.toLowerCase()] = convert.toBalance(
          selectors.selectTokenBalance(state, key)
        );
      }

      return prev;
    }, {} as Record<string, string>);
  },
};

export default slice.reducer;

// #region Helpers
const userMulticallDataParser = createMulticallDataParser(
  USER_PREFIX,
  (calls) => {
    const formattedUserDetails = calls.reduce(
      (prev, next) => {
        const [, details] = next;
        const { allowance: allowanceCall, balanceOf: balanceOfCall } = details;
        const [_allowanceCall] = allowanceCall;
        const [_balanceOfCall] = balanceOfCall;
        const tokenAddress = _allowanceCall.target;
        const [, poolAddress] = _allowanceCall.args!;
        const [allowance] = _allowanceCall.result ?? [];
        const [balanceOf] = _balanceOfCall.result ?? [];
        const combinedId = `${poolAddress}-${tokenAddress}`;

        if (allowance) {
          prev.allowances[combinedId] = allowance.toString();
        }

        if (balanceOf) {
          prev.balances[combinedId] = balanceOf.toString();
        }

        return prev;
      },
      {
        allowances: {},
        balances: {},
      } as {
        allowances: Record<string, string>;
        balances: Record<string, string>;
      }
    );

    return formattedUserDetails;
  }
);
// #endregion
