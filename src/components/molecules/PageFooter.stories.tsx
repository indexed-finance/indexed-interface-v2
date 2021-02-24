import { Layout as AntLayout } from "antd";
import PageFooter, { Props } from "./PageFooter";
import React from "react";

export const Basic = (args: Props) => {
  return (
    <AntLayout>
      <PageFooter {...args} />
    </AntLayout>
  );
};

(Basic as typeof PageFooter & { args: Props }).args = {
  left: (
    <>
      <button>A</button>
      <button>B</button>
    </>
  ),
  right: (
    <>
      <button>A</button>
      <button>B</button>
      <button>C</button>
      <button>D</button>
    </>
  ),
};

export default {
  title: "Molecules/PageFooter",
  component: PageFooter,
};
