import { Badge, Space, Typography } from "antd";
import { FormattedPortfolioDatum } from "features";
import { IndexCard } from "components/molecules";
import { Link } from "react-router-dom";
import { Progress } from "components/atoms";
import { useBreakpoints } from "helpers";
import { useTranslation } from "i18n";

export default function PortfolioCard({
  address,
  link,
  name,
  earned,
  symbol,
  value,
  balance,
  staking,
  weight,
}: FormattedPortfolioDatum) {
  const tx = useTranslation();
  const { isMobile } = useBreakpoints();

  let ribbonText = "";

  if (earned && earned !== "0.00") {
    ribbonText = tx("EARNED_X_NDX", {
      __x: earned,
    });
  } else if (staking) {
    ribbonText = tx("STAKING_X_Y", {
      __x: staking,
      __y: symbol,
    });
  }

  const card = (
    <IndexCard
      style={{ width: isMobile ? 300 : 550 }}
      direction={isMobile ? "vertical" : "horizontal"}
      title={name}
      subtitle={symbol}
      actions={[
        {
          title: tx("BALANCE_IN_TOKENS"),
          value: `${balance} ${symbol}`,
        },
        {
          title: tx("VALUE_IN_USD"),
          value: <Typography.Text type="success">{value}</Typography.Text>,
        },
      ]}
    >
      <Space
        direction="vertical"
        align="center"
        style={{ paddingTop: 25 }}
        wrap={true}
      >
        <Progress
          status="active"
          type="dashboard"
          style={{ marginLeft: 20 }}
          percent={parseFloat(weight.replace(/%/g, ""))}
        />
      </Space>
    </IndexCard>
  );
  const wrapped = ribbonText ? (
    <Badge.Ribbon
      key={address}
      color="magenta"
      style={{ top: isMobile ? 80 : 0 }}
      text={ribbonText}
    >
      {card}
    </Badge.Ribbon>
  ) : (
    card
  );

  return link ? <Link to={link}>{wrapped}</Link> : wrapped;
}
