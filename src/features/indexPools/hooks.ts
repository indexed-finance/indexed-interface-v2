import { AppState } from "features/store";
import { useSelector } from "react-redux";
import selectors from "./selectors";

export const usePool = (poolId: string) => useSelector(
  (state: AppState) => selectors.selectPool(state, poolId)
);

export const usePoolTokenIds = (poolId: string) => useSelector(
  (state: AppState) => selectors.selectPoolTokenIds(state, poolId)
);

export const usePoolTokenAddresses = (poolId: string) => useSelector(
  (state: AppState) => selectors.selectPoolTokenAddresses(state, poolId)
);

export const usePoolUnderlyingTokens = (poolId: string) => useSelector(
  (state: AppState) => selectors.selectPoolUnderlyingTokens(state, poolId)
);