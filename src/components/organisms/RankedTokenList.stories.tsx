import RankedTokenList, { Props } from "./RankedTokenList";

export const Basic = (args: Props) => <RankedTokenList {...args} />;

Basic.args = {
  tokens: [
    {
      symbol: "AAVE",
      current: {
        balance: "30000000",
        weight: "30000000",
      },
    },
    {
      symbol: "LINK",
      current: {
        balance: "30000000",
        weight: "30000000",
      },
    },
    {
      symbol: "UNI",
      current: {
        balance: "30000000",
        weight: "30000000",
      },
    },
  ],
};

export default {
  title: "Organisms/RankedTokenList",
  component: RankedTokenList,
};
