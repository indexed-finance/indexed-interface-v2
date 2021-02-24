import React from "react";
import TokenSelector from "./_TokenSelector";

export const Basic = () => (
  <div style={{ width: "500px" }}>
    <TokenSelector
      options={[
        {
          selected: true,
          amount: 20,
          symbol: "AAVE",
          name: "AAVE Token",
        },
        {
          selected: false,
          amount: 10,
          symbol: "LINK",
          name: "Chainlink",
        },
      ]}
      onSelectOption={(option) => console.log(option)}
      onChangeSubfield={(option, amount) => console.log(option, amount)}
    />
  </div>
);

export default {
  title: "Molecules/TokenSelector",
  component: TokenSelector,
};
