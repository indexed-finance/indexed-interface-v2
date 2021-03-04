import { ScreenHeader } from "components";
import { Subscreen } from "../subscreens";
import React from "react";

export default function Settings() {
  return (
    <>
      <ScreenHeader title="Settings" />
      <Subscreen icon={null} title="Extras">
        Lorem
      </Subscreen>
    </>
  );
}
