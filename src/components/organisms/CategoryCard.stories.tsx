import CategoryCard, { Props } from "./CategoryCard";
import React from "react";

const Template = (args: Props) => <CategoryCard {...args} />;

export const Basic = Template.bind({});

(Basic as typeof CategoryCard & { args: Props }).args = {
  category: {
    id: "example",
    description: "An example category.",
    brief: "An example category.",
    name: "Cryptocurrency",
    symbol: "CC",
    indexPools: [],
    tokens: [],
  },
};

export default {
  title: "Atoms/CategoryCard",
  component: CategoryCard,
};
