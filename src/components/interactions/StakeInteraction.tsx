import {
  Alert,
  Button,
  Col,
  Divider,
  Radio,
  Row,
  Space,
  Typography,
} from "antd";
import { BiLinkExternal } from "react-icons/bi";
import { FormattedIndexPool } from "features";
import { Formik } from "formik";
import { NDX_ADDRESS } from "config";
import { Token, TokenSelector } from "components/atomic";

interface Props {
  indexPool: FormattedIndexPool;
}

export function StakeInteraction({ indexPool }: Props) {
  return (
    <Row gutter={20} style={{ height: "100%" }}>
      <Col span={12}>
        <Formik
          initialValues={{
            asset: "",
            amount: 0,
          }}
          onSubmit={console.log}
        >
          <Space direction="vertical" style={{ width: "100%", height: "100%" }}>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Radio.Group value="Stake">
                <Radio value="Stake">Stake</Radio>
                <Radio value="Unstake">Unstake</Radio>
              </Radio.Group>
              <Button type="primary" danger={true}>
                Exit
              </Button>
            </Space>
            <TokenSelector
              label=""
              assets={[]}
              value={{
                token: "CC10",
                amount: 0,
              }}
              showBalance={false}
            />
            <Space style={{ width: "100%" }}>
              <Alert
                type="info"
                message="Estimated Reward"
                description={
                  <Token
                    name="NDX"
                    amount="0.00"
                    address={NDX_ADDRESS}
                    symbol="NDX / Day"
                    size="tiny"
                  />
                }
              />
              <Alert
                type="warning"
                message="Pool Weight"
                description={
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    0.113%
                  </Typography.Title>
                }
              />
            </Space>
            <Divider />
            <Button type="primary" block={true}>
              Stake
            </Button>
          </Space>
        </Formik>
      </Col>
      <Col
        span={12}
        style={{ paddingBottom: 12, height: 275, overflow: "auto" }}
      >
        <Typography.Title level={2}>Stats</Typography.Title>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            Earned Rewards
          </Typography.Title>
          <Space style={{ justifyContent: "space-between", width: "100%" }}>
            <Token
              name="NDX"
              amount="0.00"
              address={NDX_ADDRESS}
              symbol="NDX"
              size="tiny"
            />
            <Button.Group size="large">
              <Button type="default">Claim</Button>
            </Button.Group>
          </Space>
        </div>
        <Divider style={{ marginTop: 5, marginBottom: 5 }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            Currently Staked
          </Typography.Title>
          <Token
            name={indexPool.name}
            amount="0.00"
            address={indexPool.id}
            symbol={indexPool.symbol}
            size="tiny"
          />
        </div>
        <Divider style={{ marginTop: 5, marginBottom: 5 }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            Reward Rate
          </Typography.Title>
          <Space>
            <Token
              name="NDX"
              amount="0.00"
              address={NDX_ADDRESS}
              symbol="NDX / Day"
              size="tiny"
            />
          </Space>
        </div>
        <Divider style={{ marginTop: 5, marginBottom: 5 }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            Rewards Pool
          </Typography.Title>
          <Button type="default">
            <Space>
              <span>View</span>
              <BiLinkExternal style={{ fontSize: 16 }} />
            </Space>
          </Button>
        </div>
        <Divider style={{ marginTop: 5, marginBottom: 5 }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            Staking Ends
          </Typography.Title>
          <Typography.Text>Jun 4, 2021, 6:15 PM UTC</Typography.Text>
        </div>
        <Divider style={{ marginTop: 5, marginBottom: 5 }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            Total Staked
          </Typography.Title>
          <Token
            name={indexPool.name}
            amount="1770.00"
            address={indexPool.id}
            symbol={indexPool.symbol}
            size="tiny"
          />
        </div>
        <Divider style={{ marginTop: 5, marginBottom: 5 }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            Total NDX / Day
          </Typography.Title>
          <Token
            name="NDX"
            amount="120.59"
            address={NDX_ADDRESS}
            symbol="NDX"
            size="tiny"
          />
        </div>
        <Divider style={{ marginTop: 5, marginBottom: 5 }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            Total NDX Staked
          </Typography.Title>
          <Token
            name="NDX"
            amount="1200.00"
            address={NDX_ADDRESS}
            symbol="NDX"
            size="tiny"
          />
        </div>
        <Divider style={{ marginTop: 5, marginBottom: 5 }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            Staking Token
          </Typography.Title>
          <Button type="default">
            <Space>
              <span>CC10</span>
              <BiLinkExternal style={{ fontSize: 16 }} />
            </Space>
          </Button>
        </div>
      </Col>
    </Row>
  );
}
