import { FormattedIndexPool } from "features";
import { RiWallet3Line } from "react-icons/ri";
import React from "react";
import Subscreen from "./Subscreen";

export default function Interact({ pool }: { pool: FormattedIndexPool }) {
  return (
    <Subscreen icon={<RiWallet3Line />} title={pool.name}>
      {null}
    </Subscreen>
  );
}
