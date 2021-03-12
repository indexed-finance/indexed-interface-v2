import { Result as AbiCoderResult } from "ethers/lib/utils";
import { IERC20 } from "ethereum/abi";
import { MultiCallTaskHandler, TokenUserDataTask } from "./types";
import { actions, selectors } from "features";
import { convert } from "helpers";
import chunk from "lodash.chunk";
import type { Call, MultiCallResults } from "./types";

const TOKEN_USER_DATA_CALL_COUNT = 2;

function formatTokenUserDataResults(
  { blockNumber, results }: MultiCallResults,
  tokenAddresses: string[]
) {
  const responseDataByTokenAddress = chunk(
    results,
    TOKEN_USER_DATA_CALL_COUNT
  ).reduce((prev, next, index) => {
    prev[tokenAddresses[index]] = next;
    return prev;
  }, {} as Record<string, AbiCoderResult[]>);
  const tokens = tokenAddresses.reduce((prev, next) => {
    const [allowance, balance] = responseDataByTokenAddress[next].map((entry) =>
      convert.toBigNumber(entry.toString()).toString()
    );

    prev[next] = { allowance, balance };
    return prev;
  }, {} as Record<string, { allowance: string; balance: string }>);

  return {
    blockNumber,
    data: tokens
  };
}

const TokenUserDataTaskHandler: MultiCallTaskHandler<TokenUserDataTask> = {
  kind: "TokenUserData",
  constructCalls: (
    { account, state }, { pool, tokens }
  ): Call[] => {
    const _pool = selectors.selectPool(state, pool);
    if (!account || !_pool) return [];
    const _interface = IERC20;
    return tokens.reduce((prev, next) => {
      prev.push(
        {
          target: next,
          interface: _interface,
          function: "allowance",
          args: [account, pool],
        },
        {
          target: next,
          interface: _interface,
          function: "balanceOf",
          args: [account],
        }
      );
      return prev;
    }, [] as Call[]);
  },

  handleResults: ({ dispatch }, { pool, tokens }, results) => {
    if (!results.results.length) return;
    const { blockNumber, data: userData } = formatTokenUserDataResults(results, tokens);
    dispatch(
      actions.poolUserDataLoaded({
        blockNumber: +blockNumber,
        poolId: pool,
        userData,
      })
    );
  }
}

export default TokenUserDataTaskHandler;