import { ETH_BALANCE_GETTER, NDX_ADDRESS } from "config";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { changedNetwork } from "features/actions"; // Circular dependency.
import { constants } from "ethers";
import { convert, createMulticallDataParser } from "helpers";
import { fetchMulticallData } from "../batcher/requests";
import { tokensSelectors } from "../tokens";
import { transactionFinalized } from "../transactions/actions";
import type { AppState } from "../store";
import type { NormalizedUser } from "./types";

export type ApprovalStatus = "unknown" | "approval needed" | "approved";

const initialState: NormalizedUser & { connected: boolean } = {
  address: "",
  allowances: {},
  balances: {},
  ndx: null,
  connected: false,
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
    walletConnected(state) {
      state.connected = true;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchMulticallData.fulfilled, (state, action) => {
        const userData = userMulticallDataParser(action.payload);

        if (userData) {
          const { allowances, balances, ndx } = userData;
          for (const key of Object.keys(balances)) {
            state.balances[key.toLowerCase()] = balances[key];
          }
          for (const key of Object.keys(allowances)) {
            state.allowances[key.toLowerCase()] = allowances[key];
          }
          state.ndx = ndx;
        }

        return state;
      })
      .addCase(transactionFinalized, (state, action) => {
        const { extra } = action.payload;
        if (extra && extra.type === "ERC20.approve") {
          const { tokenAddress, spender, amount } = extra.approval;
          state.allowances[`user${spender}-user${tokenAddress}`.toLowerCase()] =
            amount;
        }
      })
      .addCase(changedNetwork, (state, action) => {
        delete state.balances[constants.AddressZero];
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
  selectTokenBalances(state: AppState, tokenIds: string[]) {
    return tokenIds.map((id) => state.user.balances[id.toLowerCase()] ?? "0");
  },
  selectApprovalStatus(
    state: AppState,
    spender: string,
    tokenId: string,
    amount: string
  ): ApprovalStatus {
    if (tokenId === constants.AddressZero) {
      return "approved";
    }
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
  selectUserConnected(state: AppState) {
    return state.user.connected;
  },
};

// #region Helpers
const userMulticallDataParser = createMulticallDataParser("User", (calls) => {
  const formattedUserDetails = calls.reduce(
    (prev, next) => {
      const [, details] = next;
      const { allowance: allowanceCall, balanceOf: balanceOfCall } = details;

      if (allowanceCall && balanceOfCall) {
        const [_allowanceCall] = allowanceCall;
        const [_balanceOfCall] = balanceOfCall;
        let tokenAddress = _allowanceCall.target.toLowerCase();
        if (tokenAddress === ETH_BALANCE_GETTER.toLowerCase()) {
          tokenAddress = constants.AddressZero;
        }
        const [, poolAddress] = _allowanceCall.args!;
        const [allowance] = _allowanceCall.result ?? [];
        const [balanceOf] = _balanceOfCall.result ?? [];
        const combinedId = `user${poolAddress}-user${tokenAddress}`;

        if (allowance) {
          prev.allowances[combinedId.toLowerCase()] = allowance.toString();
        }

        if (balanceOf) {
          prev.balances[tokenAddress.toLowerCase()] = balanceOf.toString();
        }
      } else if (balanceOfCall.length > 0 && balanceOfCall[0].result) {
        // NDX token has no allowance.
        const [_balanceOfCall] = balanceOfCall;
        const [balanceOf] = _balanceOfCall.result ?? [];
        let tokenAddress = _balanceOfCall.target.toLowerCase();
        if (tokenAddress === ETH_BALANCE_GETTER.toLowerCase()) {
          tokenAddress = constants.AddressZero;
        }
        const value = (balanceOf ?? "").toString();

        prev.balances[tokenAddress] = value;

        if (tokenAddress === NDX_ADDRESS[1].toLowerCase()) {
          prev.ndx = value;
        }
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
});
// #endregion
