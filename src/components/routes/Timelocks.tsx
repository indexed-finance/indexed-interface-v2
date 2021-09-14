import { Col, Row, Space } from "antd";
import { Page } from "components/atomic";
import { TimelockCard, TimelockWithdrawalForm } from "components/dndx";

export default function Timelocks() {
  return (
    <Page title="Timelocks" hasPageHeader={true}>
      <Space direction="vertical" size="large">
        <TimelockWithdrawalForm />

        <Row>
          <Col span={8}>
            <TimelockCard
              dndxAmount={58.24}
              baseNdxAmount={14.56}
              duration={31104000}
              dividends={12.04}
              timeLeft={0}
              unlocksAt={1631303807596 / 1000}
            />
          </Col>
          <Col span={8}>
            <TimelockCard
              dndxAmount={58.24}
              baseNdxAmount={14.56}
              duration={31104000}
              dividends={12.04}
              timeLeft={1037000}
              unlocksAt={1631303807596 / 1000}
            />
          </Col>
        </Row>
      </Space>
    </Page>
  );
}
