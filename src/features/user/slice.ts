import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { convert, createMulticallDataParser } from "helpers";
import { multicallDataReceived } from "features/actions";
import { stakingMulticallDataParser } from "../staking/slice";
import { tokensSelectors } from "features/tokens";
import type { AppState } from "features/store";
import type { NormalizedUser } from "ethereum/types";

export type ApprovalStatus = "unknown" | "approval needed" | "approved";

export const USER_CALLER = "User Data";

const initialState: NormalizedUser = {
  address: "",
  allowances: {},
  balances: {},
  staking: {},
  ndx: null,
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
    builder.addCase(multicallDataReceived, (state, action) => {
      const userData = userMulticallDataParser(action.payload);
      const stakingData = stakingMulticallDataParser(action.payload);

      if (userData) {
        const { allowances, balances, ndx } = userData;

        state.allowances = allowances;
        state.balances = balances;
        state.ndx = ndx;
      }

      if (stakingData) {
        for (const [stakingPoolAddress, update] of Object.entries(
          stakingData
        )) {
          if (update.userData) {
            state.staking[stakingPoolAddress] = {
              balance: update.userData.userStakedBalance,
              earned: update.userData.userRewardsEarned,
            };
          }
        }
      }

      return state;
    }),
});

export const { actions: userActions, reducer: userReducer } = slice;

export const userSelectors = {
  selectUser(state: AppState) {
    return state.user;
  },
  selectUserAddress(state: AppState) {
    return state.user.address;
  },
  selectNdxBalance(state: AppState) {
    return state.user.ndx ? convert.toBalanceNumber(state.user.ndx) : 0;
  },
  selectTokenAllowance(state: AppState, poolId: string, tokenId: string) {
    return state.user.allowances[`user${poolId}-user${tokenId}`.toLowerCase()];
  },
  selectTokenBalance(state: AppState, tokenId: string) {
    return state.user.balances[tokenId.toLowerCase()] ?? "0";
  },
  selectApprovalStatus(
    state: AppState,
    spender: string,
    tokenId: string,
    amount: string
  ): ApprovalStatus {
    const entry = tokensSelectors.selectTokenById(state, tokenId);

    if (entry) {
      const allowance = userSelectors.selectTokenAllowance(
        state,
        spender,
        tokenId
      );
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
          userSelectors.selectTokenBalance(state, key)
        );
      }

      return prev;
    }, {} as Record<string, string>);
  },
};

// #region Helpers
const userMulticallDataParser = createMulticallDataParser(
  USER_CALLER,
  (calls) => {
    const formattedUserDetails = calls.reduce(
      (prev, next) => {
        const [, details] = next;
        const { allowance: allowanceCall, balanceOf: balanceOfCall } = details;

        if (allowanceCall && balanceOfCall) {
          const [_allowanceCall] = allowanceCall;
          const [_balanceOfCall] = balanceOfCall;
          const tokenAddress = _allowanceCall.target;
          const [, poolAddress] = _allowanceCall.args!;
          const [allowance] = _allowanceCall.result ?? [];
          const [balanceOf] = _balanceOfCall.result ?? [];
          const combinedId = `user${poolAddress}-user${tokenAddress}`;

          if (allowance) {
            prev.allowances[combinedId] = allowance.toString();
          }

          if (balanceOf) {
            prev.balances[tokenAddress] = balanceOf.toString();
          }
        } else if (balanceOfCall) {
          // NDX token has no allowance.
          const [_balanceOfCall] = balanceOfCall;
          const [balanceOf] = _balanceOfCall.result ?? [];

          prev.ndx = (balanceOf ?? "").toString();
        }

        return prev;
      },
      {
        allowances: {},
        balances: {},
        ndx: null,
      } as {
        allowances: Record<string, string>;
        balances: Record<string, string>;
        ndx: null | string;
      }
    );

    return formattedUserDetails;
  }
);
// #endregion
