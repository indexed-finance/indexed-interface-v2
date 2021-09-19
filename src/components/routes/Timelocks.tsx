import { Page } from "components/atomic";
import { Space } from "antd";
import { TimelockCard, TimelockWithdrawalForm } from "components/dndx";
import { useTimelocksRegistrar } from "hooks/timelock-hooks";

export default function Timelocks() {
  useTimelocksRegistrar("0xbc86230689E8887B55e64eF0C85C9B01fC3bE20c");

  return (
    <Page title="Timelocks" hasPageHeader={true}>
      <Space direction="vertical" size="large">
        <Space align="start">
          <div style={{ marginRight: 18 }}>
            <TimelockWithdrawalForm isReady={true} />
          </div>
          <TimelockWithdrawalForm isReady={false} />
        </Space>
        <Space size="large" align="start">
          <TimelockCard
            dndxAmount={58.24}
            baseNdxAmount={14.56}
            duration={31104000}
            dividends={12.04}
            timeLeft={0}
            unlocksAt={1631303807596 / 1000}
          />
          <TimelockCard
            dndxAmount={58.24}
            baseNdxAmount={14.56}
            duration={31104000}
            dividends={12.04}
            timeLeft={1037000}
            unlocksAt={1631303807596 / 1000}
          />
        </Space>
      </Space>
    </Page>
  );
}
