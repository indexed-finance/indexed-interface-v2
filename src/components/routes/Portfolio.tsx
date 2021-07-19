import { Alert, Checkbox, Col, Empty, Row, Space, Typography } from "antd";
import { Fade } from "components/animations";
import { Page, PortfolioWidget, WalletConnector } from "components/atomic";
import { selectors } from "features";
import {
  useBreakpoints,
  useMasterChefRegistrar,
  useNewStakingRegistrar,
  usePortfolioData,
  useStakingRegistrar,
  useTranslator,
} from "hooks";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

export default function Portfolio() {
  const tx = useTranslator();
  const [showOwnedAssets, setShowOwnedAssets] = useState(true);
  const { ndx, tokens, totalValue } = usePortfolioData({
    onlyOwnedAssets: showOwnedAssets,
  });
  const data = useMemo(() => [ndx, ...tokens], [ndx, tokens]);
  const { isMobile } = useBreakpoints();
  const isUserConnected = useSelector(selectors.selectUserConnected);
  const [fadedWidget, setFadedWidget] = useState(-1);

  useStakingRegistrar();
  useNewStakingRegistrar();
  useMasterChefRegistrar();

  useEffect(() => {
    if (fadedWidget < data.length - 1) {
      setTimeout(() => {
        setFadedWidget((prev) => prev + 1);
      }, 200);
    }
  }, [fadedWidget, data.length]);

  return (
    <Page
      hasPageHeader={true}
      title={tx("PORTFOLIO")}
      extra={
        isUserConnected ? (
          <Space direction="vertical">
            <Typography.Title
              level={3}
              style={{ margin: 0, marginRight: "1rem" }}
            >
              Total value:{" "}
              {!isMobile && (
                <Typography.Text type="success" style={{ margin: 0 }}>
                  {totalValue}
                </Typography.Text>
              )}
            </Typography.Title>
            {isMobile && (
              <Typography.Title type="success" style={{ margin: 0 }}>
                {totalValue}
              </Typography.Title>
            )}
            <Checkbox
              checked={showOwnedAssets}
              onChange={(value) => setShowOwnedAssets(value.target.checked)}
            >
              Only show owned or staked assets
            </Checkbox>
          </Space>
        ) : (
          <Alert
            style={{ maxWidth: 500 }}
            showIcon={true}
            type="warning"
            message="Connect your wallet to view."
          />
        )
      }
    >
      {isUserConnected ? (
        <Row gutter={[20, 20]}>
          {data
            .filter((heldAsset) => !heldAsset.symbol.includes("ERROR"))
            .map((heldAsset, index) => (
              <Col xs={24} sm={8}>
                <Fade key={heldAsset.address} in={fadedWidget >= index}>
                  <PortfolioWidget {...heldAsset} />
                </Fade>
              </Col>
            ))}
        </Row>
      ) : (
        <Space direction="vertical" align="center" style={{ width: "100%" }}>
          <Empty description="No wallet detected." />
          <WalletConnector />
        </Space>
      )}
    </Page>
  );
}
