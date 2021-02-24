import Flipper from "./Flipper";
import React from "react";

export const Basic = () => <Flipper onFlip={() => 1} />;

export default {
  title: "Atoms/Flipper",
  component: Flipper,
};
