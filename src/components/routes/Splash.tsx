import { Alert, Button, Divider, Space, Statistic, Typography } from "antd";
import {
  IndexPoolWidgetGroup,
  Logo,
  Page,
  SplashSection,
  VaultGroup,
} from "components/atomic";
import { selectors } from "features";
import { useAllVaultsRegistrar, useBreakpoints, useVaultsCount } from "hooks";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Splash() {
  const poolsExist = useSelector(selectors.selectPoolCount) > 0;
  const assetsUnderManagement = useSelector(
    selectors.selectTotalAssetsUnderManagement
  );
  const history = useHistory();
  const { isMobile } = useBreakpoints();
  const vaultsCount = useVaultsCount();
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
        type="warning"
        message={
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>
              Remaining assets from the{" "}
              <a
                href="https://etherscan.io/token/0xfa6de2697d59e88ed7fc4dfe5a33dac43565ea41"
                target="_blank"
                rel="noreferrer"
              >
                DEFI5
              </a>{" "}
              and{" "}
              <a
                href="https://etherscan.io/token/0x17ac188e09a7890a1844e5e65471fe8b0ccfadf3"
                target="_blank"
                rel="noreferrer"
              >
                CC10
              </a>{" "}
              <a
                href="https://discord.com/channels/@me/991236780676349963/994954651835314177"
                style={{ color: "#FF160C" }}
              >
                exploits
              </a>{" "}
              are available to redeem.
            </span>

            <span>
              If you are a tokenholder of either asset, they can be redeemed for
              the underlying assets.
            </span>

            <Button
              type="primary"
              danger
              style={{
                padding: "5px!important",
                alignSelf: "center",
                marginTop: "10px",
              }}
            >
              <a
                href="http://drain-reversal.indexed.finance/"
                target="_blank"
                rel="noreferrer"
              >
                Redemption App
              </a>
            </Button>
          </div>
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
      {vaultsCount > 0 ? (
        <>
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
        </>
      ) : (
        <> </>
      )}

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
