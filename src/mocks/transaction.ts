import { BigNumber } from "@ethersproject/bignumber";
import {
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/abstract-provider";
import { actions, store } from "features";
import { sleep } from "helpers";

export async function sendMockTransaction() {
  const receipt: TransactionReceipt = {
    to: "0x0",
    from: "0x0",
    contractAddress: "0x0",
    transactionIndex: 1,
    gasUsed: BigNumber.from("1"),
    logsBloom: "",
    blockHash: "",
    transactionHash: "",
    logs: [],
    blockNumber: 1,
    confirmations: 30,
    cumulativeGasUsed: BigNumber.from("2"),
    byzantium: false,
  };
  const transaction: TransactionResponse = {
    blockNumber: 1,
    blockHash: "123",
    timestamp: 1,
    confirmations: 30,
    from: "0x0",
    raw: "",
    nonce: 1337,
    gasLimit: BigNumber.from("3"),
    gasPrice: BigNumber.from("4"),
    data: "",
    value: BigNumber.from("5"),
    chainId: 1,
    hash: "",
    wait: () => Promise.resolve(receipt),
  };

  store.dispatch(
    actions.transactionStarted({
      tx: transaction,
      extra: {},
    })
  );

  await sleep(3000);

  store.dispatch(actions.transactionFinalized(receipt));
}
