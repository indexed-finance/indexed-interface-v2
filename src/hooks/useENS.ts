import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";

const useENS = () => {
  const [ensName, setENSName] = useState<string | null>(null);
  const { connector, account } = useWeb3React();

  useEffect(() => {
    const resolveENS = async () => {
      if (connector && account && ethers.utils.isAddress(account)) {
        const _provider = await connector.getProvider();
        const provider = new ethers.providers.Web3Provider(_provider, 1);
        const ensName = await provider.lookupAddress(account);
        if (ensName) setENSName(ensName);
      }
    };
    resolveENS();
  }, [account, connector]);

  return { ensName };
};

export default useENS;
