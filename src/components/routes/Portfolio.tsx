import { Page, PortfolioWidget } from "components/atomic";
import { Space, Typography } from "antd";
import { actions } from "features";
import { useDispatch } from "react-redux";
import { useEffect, useMemo } from "react";
import { usePortfolioData, useTranslator } from "hooks";

export default function Portfolio() {
  const tx = useTranslator();
  const dispatch = useDispatch();
  const { ndx, tokens, totalValue } = usePortfolioData();
  const data = useMemo(() => [ndx, ...tokens], [ndx, tokens]);

  useEffect(() => {
    setTimeout(() => dispatch(actions.sendBatch()), 200);
  }, [dispatch]);

  return (
    <Page
      hasPageHeader={true}
      title={tx("PORTFOLIO")}
      actions={
        <Space
          style={{
            width: "100%",
            justifyContent: "flex-end",
            margin: "0 9rem",
          }}
        >
          <Typography.Title level={3} style={{ margin: 0 }}>
            {tx("TOTAL_VALUE")}
          </Typography.Title>
          <Typography.Title type="success" level={3} style={{ margin: 0 }}>
            {totalValue}
          </Typography.Title>
        </Space>
      }
    >
      <Space size="large" wrap={true} align="end">
        {data.map((heldAsset) => (
          <PortfolioWidget key={heldAsset.address} {...heldAsset} />
        ))}
      </Space>
    </Page>
  );
}
