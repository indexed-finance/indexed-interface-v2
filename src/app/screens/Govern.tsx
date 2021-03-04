import { ScreenHeader } from "components";
import { Subscreen } from "../subscreens";
import React from "react";

export default function Govern() {
  return (
    <>
      <ScreenHeader title="Govern" />
      <Subscreen icon={null} title="Status">
        Status
      </Subscreen>
      <Subscreen icon={null} title="Proposals">
        Proposals
      </Subscreen>
      <Subscreen icon={null} title="Chart">
        Chart
      </Subscreen>
    </>
  );
}
