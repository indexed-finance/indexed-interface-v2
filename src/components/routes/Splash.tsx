import { Divider, Statistic, Typography } from "antd";
import {
  IndexPoolWidgetGroup,
  Logo,
  Page,
  SplashSection,
  VaultGroup,
} from "components/atomic";
import { selectors } from "features";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Splash() {
  const poolsExist = useSelector(selectors.selectPoolCount) > 0;
  const assetsUnderManagement = useSelector(
    selectors.selectTotalAssetsUnderManagement
  );
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
        <div style={{ textAlign: "center", maxWidth: 1000 }}>
          <Logo size="large" />
          <Typography.Title level={3} style={{ marginTop: 12 }}>
            Gain exposure to passively-managed crypto index portfolios
            represented by a single token.
          </Typography.Title>
          <Divider>
            {assetsUnderManagement !== "$0.00" && (
              <Statistic
                className="prominent-stat"
                title="Total Protocol Assets Under Management "
                value={assetsUnderManagement}
                style={{ marginRight: 12, marginLeft: 12 }}
              />
            )}
          </Divider>
        </div>
      </div>
      <Divider />
      <SplashSection
        banner={require("images/vaults_banner.png").default}
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
      <Divider />
      <SplashSection
        banner={require("images/indexpools_banner.png").default}
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
      <Divider />
      <SplashSection
        banner={require("images/staking_banner.png").default}
        title="STAKING"
        description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat
        quas minima dolor libero hic eum doloribus, quasi mollitia placeat.
        Recusandae mollitia veniam quaerat minima quibusdam error similique
        nisi, labore facilis!"
        catchphrase="Catchy phrase for staking"
        actionText="Stake Now"
        infoText="Read up"
        onAction={() => history.push("/staking")}
        onInfo={() => (window.location.href = "https://docs.indexed.finance/")}
      >
        {null}
      </SplashSection>
    </Page>
  );
}
