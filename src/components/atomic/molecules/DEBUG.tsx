import { Button, Space, Typography } from "antd";
import { selectors } from "features";
import { sendMockBadTransaction, sendMockGoodTransaction } from "mocks";
import { useBreakpoints } from "hooks";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

export function DEBUG() {
  const {
    isMobile,
    xs = false,
    sm = false,
    md = false,
    lg = false,
    xl = false,
    xxl = false,
  } = useBreakpoints();
  const successOrDanger = (factor: boolean) => (factor ? "success" : "danger");
  const blockNumber = useSelector(selectors.selectBlockNumber);
  const batcherStatus = useSelector(selectors.selectBatcherStatus);
  const cacheSize = useSelector(selectors.selectCacheSize);
  const fetchingCount = useSelector(selectors.selectFetchingCount);
  const initialBlockNumber = useRef(blockNumber);
  const [show, setShow] = useState(true);

  // Effect:
  // Keep track of the block number from when the page was initially loaded.
  useEffect(() => {
    if (initialBlockNumber.current === 0 && blockNumber > 0) {
      initialBlockNumber.current = blockNumber;
    }
  }, [blockNumber]);

  return show ? (
    <Space
      align="start"
      size="large"
      style={{
        position: "fixed",
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.8)",
        color: "#fafafa",
        padding: "1rem",
        zIndex: 1000,
      }}
    >
      <div>
        <legend>Screen Size</legend>
        <Typography.Paragraph type={successOrDanger(isMobile)}>
          Is mobile?
        </Typography.Paragraph>
        <Typography.Paragraph type={successOrDanger(xs)}>
          Extra Small
        </Typography.Paragraph>
        <Typography.Paragraph type={successOrDanger(sm)}>
          Small
        </Typography.Paragraph>
        <Typography.Paragraph type={successOrDanger(md)}>
          Medium
        </Typography.Paragraph>
        <Typography.Paragraph type={successOrDanger(lg)}>
          Large
        </Typography.Paragraph>
        <Typography.Paragraph type={successOrDanger(xl)}>
          Extra Large
        </Typography.Paragraph>
        <Typography.Paragraph type={successOrDanger(xxl)}>
          Huge
        </Typography.Paragraph>
      </div>
      <div>
        <legend>Block Number</legend>
        <ul>
          <li>INIT: {initialBlockNumber.current}</li>
          <li>CUR: {blockNumber}</li>
        </ul>
      </div>
      <div>
        <legend>Cache Size</legend>
        <p>{cacheSize}</p>
      </div>
      <div>
        <legend>Batcher Status</legend>
        <ul>
          {/* <li>Status: {batcherStatus.status}</li> */}
          <li>On-Chain Calls: {batcherStatus.onChainCalls}</li>
          <li>Off-Chain Calls: {batcherStatus.offChainCalls}</li>
          <li>Fetching: {fetchingCount}</li>
        </ul>
      </div>
      <div>
        <legend>Mock Transaction</legend>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button
            type="default"
            block={true}
            onClick={() => sendMockGoodTransaction()}
          >
            Send Tx
          </Button>
          <Button
            type="default"
            danger={true}
            block={true}
            onClick={() => sendMockBadTransaction()}
          >
            Send Bad Tx
          </Button>
        </Space>
      </div>
      <Button onClick={() => setShow(false)}>Hide DEBUG</Button>
    </Space>
  ) : (
    <Button
      onClick={() => setShow(true)}
      style={{
        position: "fixed",
        right: 0,
        bottom: 0,
        zIndex: 1000,
      }}
    >
      Show DEBUG
    </Button>
  );
}
