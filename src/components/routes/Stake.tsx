import { Alert, Button, Col, Descriptions, Row, Space, Statistic } from "antd";
import { AppState, selectors } from "features";
import { Formik } from "formik";
import { Label, Page, TokenSelector } from "components/atomic";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Stake() {
  const { id } = useParams<{ id: string }>();
  const toStake = useSelector((state: AppState) =>
    selectors.selectStakingPool(state, id)
  );
  const relevantIndexPool = useSelector((state: AppState) =>
    toStake ? selectors.selectPool(state, toStake.indexPool) : ""
  );

  if (!(toStake && relevantIndexPool)) {
    return <div>Derp</div>;
  }

  return (
    <Page
      hasPageHeader={true}
      title={`Stake ${
        toStake.isWethPair
          ? `ETH/${relevantIndexPool.symbol}`
          : relevantIndexPool.symbol
      }`}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Row gutter={100}>
          <Col span={12}>
            <Formik
              initialValues={{
                asset: "",
                amount: 0,
              }}
              onSubmit={console.log}
            >
              <>
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Label>Amount</Label>
                    <TokenSelector
                      assets={[]}
                      value={{
                        token: "NFTP",
                        amount: 0,
                      }}
                      selectable={false}
                      showBalance={false}
                      autoFocus={true}
                    />
                  </div>

                  <Alert
                    type="info"
                    message={
                      <Row>
                        <Col span={12}>
                          <Statistic
                            title="Estimated Reward"
                            value="0.00 NDX / Day"
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic title="Pool Weight" value="0.113%" />
                        </Col>
                      </Row>
                    }
                  />

                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Label>Actions</Label>
                    <Row gutter={24}>
                      <Col span={6}>
                        <Button type="primary" block={true}>
                          Stake
                        </Button>
                      </Col>
                      <Col span={6}>
                        <Button type="primary" danger={true} block={true}>
                          Unstake
                        </Button>
                      </Col>
                      <Col span={6}>
                        <Button type="default" block={true}>
                          Claim
                        </Button>
                      </Col>
                      <Col span={6}>
                        <Button type="default" danger={true} block={true}>
                          Exit
                        </Button>
                      </Col>
                    </Row>
                  </Space>
                </Space>
              </>
            </Formik>
          </Col>
          <Col span={12}>
            <Descriptions layout="vertical" bordered={true} column={2}>
              <Descriptions.Item label="Earned Rewards">
                (value)
              </Descriptions.Item>
              <Descriptions.Item label="Currently Staked">
                (value)
              </Descriptions.Item>
              <Descriptions.Item label="Reward Rate per Day">
                (value)
              </Descriptions.Item>
              <Descriptions.Item label="Rewards Pool">
                (value)
              </Descriptions.Item>
              <Descriptions.Item label="Staking Ends">
                (value)
              </Descriptions.Item>
              <Descriptions.Item label="Total Staked">
                (value)
              </Descriptions.Item>
              <Descriptions.Item label="Total NDX per Day">
                (value)
              </Descriptions.Item>
              <Descriptions.Item label="Staking Token">
                (value)
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Space>
    </Page>
  );
}
