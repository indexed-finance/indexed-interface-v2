import CategoryTable from "./CategoryTable";
import React from "react";

const indexPool = {
  name: "Example Pool",
  symbol: "EP",
  chainId: 1,
  lastUpdate: 1,
  size: 12,
  maxTotalSupply: "37000000000000000000",
  isPublic: true,
  category: "CC",
  addresses: {
    primary: "0x0",
    initializer: "0x0",
    index: "0x0",
  },
  fees: {
    swap: "37000000000000000000",
    totalUsd: "37000000000000000000",
  },
  totals: {
    supply: "37000000000000000000",
    swapVolumeUsd: "575000",
    valueLockedUsd: "575000",
    volumeUsd: "37000000000000000000", // From BN
    weight: "37000000000000000000", // From BN
  },
  tokens: [],
};

const category = {
  id: "example",
  description: "An example category.",
  brief: "An example category.",
  name: "Cryptocurrency",
  symbol: "CC",
  indexPools: [indexPool],
  tokens: [],
};

export const Basic = () => <CategoryTable category={category} />;

export default {
  title: "Organisms/CategoryTable",
  component: CategoryTable,
};
