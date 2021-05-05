import { BiLinkExternal } from "react-icons/bi";
import { Button, Col, Row, Space, Statistic, Typography } from "antd";
import { FormattedIndexPool } from "features";
import { Formik } from "formik";
import { Label, Token, TokenSelector } from "components/atomic";
import { NDX_ADDRESS } from "config";

interface Props {
  indexPool: FormattedIndexPool;
}

export function StakeInteraction({ indexPool }: Props) {
  return (
    <Row gutter={100} style={{ height: "100%" }}>
      <Col span={10}>
        <Formik
          initialValues={{
            asset: "",
            amount: 0,
          }}
          onSubmit={console.log}
        >
          <Space
            direction="vertical"
            style={{
              width: "100%",
              height: "100%",
              justifyContent: "space-evenly",
            }}
          >
            <div>
              <Label style={{ paddingLeft: 7 }}>Amount</Label>
              <TokenSelector
                assets={[]}
                value={{
                  token: "CC10",
                  amount: 0,
                }}
                selectable={false}
                showBalance={false}
                autoFocus={true}
              />
            </div>

            <Space size="large" style={{ paddingLeft: 7 }}>
              <Statistic title="Estimated Reward" value="0.00 NDX / Day" />
              <Statistic title="Pool Weight" value="0.113%" />
            </Space>

            <div style={{ width: "100%" }}>
              <Button type="default" block={true}>
                Unstake
              </Button>
              <Button type="primary" block={true}>
                Stake
              </Button>
            </div>
          </Space>
        </Formik>
      </Col>
      <Col
        span={14}
        style={{ paddingBottom: 12, height: 275, overflow: "auto" }}
      >
        <Typography.Title level={2}>Stats</Typography.Title>
        <Space size="large" direction="vertical" style={{ width: "100%" }}>
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
                <Button type="default" danger={true}>
                  Exit
                </Button>
              </Button.Group>
            </Space>
          </div>

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

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "column",
              width: "100%",
            }}
          >
            <Typography.Title level={4} style={{ margin: 0 }}>
              Reward Rate / Day
            </Typography.Title>
            <Space>
              <Token
                name="NDX"
                amount="0.00"
                address={NDX_ADDRESS}
                symbol="NDX"
                size="tiny"
              />
            </Space>
          </div>

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
        </Space>
      </Col>
    </Row>
  );
}
