import {
  IndexPoolWidgetGroup,
  Page,
  SplashSection,
  VaultGroup,
} from "components/atomic";
import { Statistic, Typography } from "antd";
import { selectors } from "features";
import { useBreakpoints, useTranslator } from "hooks";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Splash() {
  const tx = useTranslator();
  const poolsExist = useSelector(selectors.selectPoolCount) > 0;
  const assetsUnderManagement = useSelector(
    selectors.selectTotalAssetsUnderManagement
  );
  const { isMobile } = useBreakpoints();
  const history = useHistory();

  return (
    <Page hasPageHeader={false}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 1000, marginBottom: 48 }}>
          <Typography.Title style={{ fontSize: isMobile ? 36 : 64 }}>
            {tx("DECENTRALIZED_INDEX_PROTOCOL")}
          </Typography.Title>
          <Typography.Title level={3}>
            Gain exposure to passively-managed crypto index portfolios
            represented by a single token.
          </Typography.Title>
          {assetsUnderManagement !== "$0.00" && (
            <Statistic
              className="prominent-stat"
              title="Total Protocol Assets Under Management "
              value={assetsUnderManagement}
              style={{ fontSize: 48 }}
            />
          )}
        </div>
      </div>

      <SplashSection
        title="VAULTS"
        description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat
        quas minima dolor libero hic eum doloribus, quasi mollitia placeat.
        Recusandae mollitia veniam quaerat minima quibusdam error similique
        nisi, labore facilis!"
        catchphrase="Catchy phrase for vaults"
        actionText="Explore Vaults"
        infoText="How it works"
        onAction={() => history.push("/vaults")}
        onInfo={() => (window.location.href = "https://docs.indexed.finance/")}
      >
        <VaultGroup withTitle={true} />
      </SplashSection>
      <SplashSection
        title="INDEX POOLS"
        description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat
        quas minima dolor libero hic eum doloribus, quasi mollitia placeat.
        Recusandae mollitia veniam quaerat minima quibusdam error similique
        nisi, labore facilis!"
        catchphrase="Dive in today"
        actionText="Buy an index"
        infoText="Learn more"
        onAction={() => history.push("/index-pools")}
        onInfo={() => (window.location.href = "https://docs.indexed.finance/")}
      >
        {poolsExist && <IndexPoolWidgetGroup />}
      </SplashSection>
    </Page>
  );
}
