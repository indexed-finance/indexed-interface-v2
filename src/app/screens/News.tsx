import { ScreenHeader } from "components";
import { Subscreen } from "../subscreens";
import React from "react";

export default function News() {
  return (
    <>
      <ScreenHeader title="News" />
      <Subscreen icon={null} title="Extras">
        Lorem
      </Subscreen>
    </>
  );
}
