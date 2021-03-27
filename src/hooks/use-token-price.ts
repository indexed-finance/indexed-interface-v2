import { NDX_ADDRESS, WETH_CONTRACT_ADDRESS } from "config";
import { actions, selectors, usePricesRegistrar, useToken } from "features"


export function useTokenPrice(id: string): [true, number] | [false, undefined] {
  const token = useToken(id.toLowerCase());
  usePricesRegistrar([id], actions, selectors);
  if (token?.priceData?.price) {
    return [true, token.priceData.price];
  }
  return [false, undefined];
}

export const useEthPrice = () => useTokenPrice(WETH_CONTRACT_ADDRESS);
export const useNdxPrice = () => useTokenPrice(NDX_ADDRESS);