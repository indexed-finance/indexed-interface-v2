import { Button, Divider, Statistic, Typography } from "antd";
import { ExternalLink, IndexPoolWidgetGroup, Page } from "components/atomic";
import { Link } from "react-router-dom";
import { selectors } from "features";
import { useBreakpoints, useTranslator } from "hooks";
import { useSelector } from "react-redux";

export default function Splash() {
  const tx = useTranslator();
  const poolsExist = useSelector(selectors.selectPoolCount) > 0;
  const assetsUnderManagement = useSelector(
    selectors.selectTotalAssetsUnderManagement
  );
  const { isMobile } = useBreakpoints();

  return (
    <Page hasPageHeader={false}>
      <div style={{ textAlign: "center" }}>
        <Typography.Title style={{ fontSize: isMobile ? 40 : 64 }}>
          {tx("DECENTRALIZED_INDEX_PROTOCOL")}
        </Typography.Title>
        <Typography.Title level={2}>
          Gain exposure to passively-managed crypto index portfolios represented
          by a single token.
        </Typography.Title>
        <Statistic
          className="prominent-stat"
          title="Total Protocol Assets Under Management "
          value={assetsUnderManagement}
        />
        <Typography.Title level={3}>
          <Divider>{tx("GET_STARTED_TODAY")}</Divider>
          <Button.Group style={{ flexDirection: isMobile ? "column" : "row" }}>
            <Link to="/index-pools">
              <Button
                type="primary"
                style={{
                  textTransform: "uppercase",
                  fontSize: isMobile ? 16 : 24,
                  height: "auto",
                  marginRight: isMobile ? 0 : 10,
                  marginBottom: isMobile ? 10 : 0,
                }}
              >
                {tx("VIEW_INDEX_POOLS")}
              </Button>
            </Link>
            <ExternalLink to="https://docs.indexed.finance/" withIcon={false}>
              <Button
                type="default"
                style={{
                  fontSize: isMobile ? 16 : 24,
                  height: "auto",
                  textTransform: "uppercase",
                }}
              >
                {tx("READ_THE_DOCUMENTATION")}
              </Button>
            </ExternalLink>
          </Button.Group>
        </Typography.Title>
        <video
          autoPlay={true}
          width="100%"
          style={{ marginTop: 24 }}
          loop={true}
        >
          <source src="/splash.mp4" type="video/mp4"></source>
        </video>
      </div>
      {poolsExist && (
        <>
          <Divider orientation="left" style={{ marginBottom: 24 }}>
            <Typography.Title level={2} style={{ margin: 0 }}>
              Index Pools
            </Typography.Title>
          </Divider>
          <IndexPoolWidgetGroup />
        </>
      )}
    </Page>
  );
}
