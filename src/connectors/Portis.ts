import { PortisConnector } from "@web3-react/portis-connector";

const PORTIS_ID = process.env.REACT_APP_PORTIS_ID;

export default new PortisConnector({
  dAppId: PORTIS_ID ?? "",
  networks: [1],
});
