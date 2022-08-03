import { Alert, Button, Divider, Space, Statistic, Typography } from "antd";
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
        type="warning"
        message={
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>
              Remaining assets left unaffected from the{" "}
              <a
                href="https://etherscan.io/token/0xfa6de2697d59e88ed7fc4dfe5a33dac43565ea41"
                target="_blank"
                rel="noreferrer"
              >
                DEFI5
              </a>{", "}
              and{" "}
              <a
                href="https://etherscan.io/token/0x17ac188e09a7890a1844e5e65471fe8b0ccfadf3"
                target="_blank"
                rel="noreferrer"
              >
                CC10
              </a>{" and"}
               <a
                href="https://etherscan.io/token/0xabafa52d3d5a2c18a4c1ae24480d22b831fc0413"
                target="_blank"
                style={{ color: "#FF160C" }}
              >
                FFF
              </a>{" "}
              <a
                href="https://ndxfi.medium.com/indexed-attack-post-mortem-b006094f0bdc"
                target="_blank"
                style={{ color: "#FF160C" }}
              >
                exploits
              </a>{" "}
              are available to redeem.
            </span>

            <span>
              If you are an effected victim that held any of the above assets at the time of the exploit and still have the associated balances, they can be redeemed for
              the remaining underlying assets.
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
                Redemption
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
    </Page>
  );
}
