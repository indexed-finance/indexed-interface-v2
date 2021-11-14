import { Alert, Button, Divider, Statistic, Typography } from "antd";
import {
  IndexPoolWidgetGroup,
  Logo,
  Page,
  SplashSection,
  VaultGroup,
} from "components/atomic";
import { selectors } from "features";
import { useAllVaultsRegistrar, useBreakpoints } from "hooks";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Splash() {
  const poolsExist = useSelector(selectors.selectPoolCount) > 0;
  const assetsUnderManagement = useSelector(
    selectors.selectTotalAssetsUnderManagement
  );
  const history = useHistory();
  const { isMobile } = useBreakpoints();
  useAllVaultsRegistrar();

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
      <SplashSection
        banner={require("images/vaults_banner.png").default}
        title="VAULTS"
        description="Lend out your assets via Indexed Earn and receive the guaranteed best interest rates across the major lending protocols in DeFi. Low-fee and no-maintenance: let our non-custodial vaults do the work of allocating your funds for maximum impact."
        catchphrase="Earn interest on your assets"
        actionText="Explore Vaults"
        infoText="How it works"
        onAction={() => history.push("/vaults")}
        onInfo={() =>
          (window.location.href =
            "https://docs.indexed.finance/introduction/faq/nirn-faq")
        }
      >
        <VaultGroup withTitle={true} />
      </SplashSection>
      <Divider />
      <SplashSection
        banner={require("images/staking_banner.png").default}
        title="STAKING"
        description="Provide liquidity for our index products on major decentralised exchanges and earn our protocol governance token as a reward! Select index products are also eligible for rewards by staking them single-sided. No fees, no lock-up periods."
        catchphrase="Supply liquidity and earn NDX"
        actionText="Stake Now"
        infoText="Read up"
        onAction={() => history.push("/staking")}
        onInfo={() =>
          (window.location.href = "https://www.youtube.com/watch?v=gp7yh8Cr9iA")
        }
      >
        {null}
      </SplashSection>
    </Page>
  );
}
