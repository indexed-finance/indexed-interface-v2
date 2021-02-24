import PageHeader, { Props } from "./PageHeader";
import React from "react";

export const Basic = (args: Props) => {
  return <PageHeader {...args} />;
};

(Basic as typeof PageHeader & { args: Props }).args = {
  title: "title",
  subTitle: "subtitle",
  links: [
    {
      text: "Page A",
      route: "/",
    },
    {
      text: "Page B",
      route: "/",
    },
  ],
};

export default {
  title: "Molecules/PageHeader",
  component: PageHeader,
};
