import { AppState, actions, selectors } from "features";
import { NETWORKS_BY_ID } from "config";
import { providers } from "ethers";
import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useWeb3React } from "@web3-react/core";

export const useTheme = () => useSelector(selectors.selectTheme);

export const useConnected = () => useSelector(selectors.selectConnected);

export const useChainId = () => useSelector(selectors.selectNetwork);

export const useNetworkName = () => {
  const chainId = useChainId();
  const networkName = useMemo(() => chainId !== undefined ? NETWORKS_BY_ID[chainId]!.name : undefined, [chainId]);
  return networkName;
}

export const useLanguageName = () => useSelector(selectors.selectLanguageName);

export const useSupportedLanguages = () => useSelector(selectors.selectSupportedLanguages);

export function useRequestChangeNetworkCallback() {
  const dispatch = useDispatch()
  const { active, library: provider } = useWeb3React<providers.Web3Provider>()

  const requestChangeNetwork = useCallback(async (chainId: number) => {
    const idHex = `0x${chainId.toString(16)}`;
    if (active && provider) {
      await provider.send(
        'wallet_switchEthereumChain',
        [{ chainId: idHex }], // chainId must be in hexadecimal numbers
      ).catch(async (err: any) => {
        console.log(`CAUGHT ERR IN SWITCH CHAIN`)
        console.log(err);
        const addChainParameter = NETWORKS_BY_ID[chainId].addChainParameter;
        console.log(addChainParameter)
        await provider.send('wallet_addEthereumChain', [addChainParameter])
      })
    } else {
      dispatch(actions.changedNetwork(chainId))
    }
  }, [dispatch, active, provider]);

  return requestChangeNetwork;
}

export const useGasPrice = () => {
  const chainId = useChainId();
  const gasPrice = useSelector((state: AppState) => selectors.selectGasPrice(state, chainId));
  return gasPrice;
}