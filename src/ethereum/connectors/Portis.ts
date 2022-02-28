import { PortisConnector } from "@web3-react/portis-connector";

const PORTIS_ID = process.env.REACT_APP_PORTIS_ID;

export const portis = new PortisConnector({
  dAppId: PORTIS_ID ?? "",
  networks: [1,],
});
