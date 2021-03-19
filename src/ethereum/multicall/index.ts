import { MultiCallTaskHandler } from "./types";
import { default as PoolDataTaskHandler } from "./pool";
import { default as TokenUserDataTaskHandler } from "./tokens";
import { default as TotalSuppliesTaskHandler } from "./tokens";
import { default as UniswapPairsDataTaskHandler } from "./uniswap";

export * from "./utils";
export * from "./types";

export const taskHandlersByKind: { [key: string]: MultiCallTaskHandler } = [
  UniswapPairsDataTaskHandler,
  TokenUserDataTaskHandler,
  PoolDataTaskHandler,
  TotalSuppliesTaskHandler
].reduce(
  (prev, next) => ({ ...prev, [next.kind]: next }),
  {}
);