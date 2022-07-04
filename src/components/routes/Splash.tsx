import { Alert, Button, Divider, Statistic, Typography } from "antd";
import {
  IndexPoolWidgetGroup,
  Logo,
  Page,
  SplashSection,
} from "components/atomic";
import { selectors } from "features";
import { useBreakpoints } from "hooks";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Splash() {
  const poolsExist = useSelector(selectors.selectPoolCount) > 0;
  const assetsUnderManagement = useSelector(
    selectors.selectTotalAssetsUnderManagement
  );
  const history = useHistory();
  const { isMobile } = useBreakpoints();

  return (
    <Page hasPageHeader={false}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 12,
          background: `url(${
            require("images/header_splash_background.png").default
          })`,
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: isMobile ? 300 : 1000,
          }}
        >
          <Logo size="large" />
          <Typography.Title level={3} style={{ marginTop: 12 }}>
            Gain exposure to passively-managed crypto index portfolios
            represented by a single token.
          </Typography.Title>
          <Divider>
            {assetsUnderManagement !== "$0.00" && (
              <Statistic
                className="prominent-stat"
                title={
                  isMobile ? (
                    <>
                      Total Protocol Assets <br /> Under Management
                    </>
                  ) : (
                    "Total Protocol Assets Under Management"
                  )
                }
                value={assetsUnderManagement}
                style={{ marginTop: 12, marginRight: 12, marginLeft: 12 }}
              />
            )}
          </Divider>
        </div>
      </div>
      <Alert
        style={{ textAlign: "center" }}
        type="info"
        message={
          <>
            NEW: Enter a timelock with your NDX governance tokens and receive
            dNDX for a proportional claim on protocol revenue.{" "}
            <Button type="primary" onClick={() => history.push("/timelocks")}>
              Try it
            </Button>
          </>
        }
      />
      <Divider />
      <SplashSection
        banner={require("images/indexpools_banner.png").default}
        title="INDEX POOLS"
        description="Gain exposure to a passively-managed, zero management fee crypto index portfolio with a single token. Indexed products offer a hassle-free, battle-tested way of getting into DeFi and niche market sectors such as oracles or the metaverse."
        catchphrase="Get involved in DeFi markets"
        actionText="Buy an index"
        infoText="Learn more"
        onAction={() => history.push("/index-pools")}
        onInfo={() =>
          (window.location.href =
            "https://docs.indexed.finance/introduction/faq/pool-faq")
        }
      >
        {poolsExist && <IndexPoolWidgetGroup />}
      </SplashSection>

      <Divider />
    </Page>
  );
}
