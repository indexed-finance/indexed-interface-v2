import { BigNumber } from "@ethersproject/bignumber";
import {
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/abstract-provider";
import { actions, store } from "features";
import { sleep } from "helpers";

const availableHashes = [
  "0xb26d07fba6d6f661d5eba72cbf3f390438abc81fb36a30c7b8c5f9d59a080a60",
  "0x846048ebf6ece170e2565fc982c8927b4df7b3dcaeb3578610dd4cac6441ada9",
  "0x900b279e26b9e5313ff54a2c66a584b774d17de4de35cedffb9006ea74ae8495",
  "0x99e5ee03cdecabb45af46fe47cef09e5f9381e0053fc9378f6acccbc573cab3b",
];

let hashCounter = 0;

export async function sendMockTransaction(time = 12000) {
  const next = availableHashes[hashCounter++];
  const receipt: TransactionReceipt = {
    to: "0x0",
    from: "0x0",
    contractAddress: "0x0",
    transactionIndex: 1,
    gasUsed: BigNumber.from("1"),
    logsBloom: "",
    blockHash: "",
    transactionHash: next,
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
    hash: next,
    wait: () => Promise.resolve(receipt),
  };

  store.dispatch(
    actions.transactionStarted({
      tx: transaction,
      extra: {},
    })
  );

  await sleep(time);

  store.dispatch(actions.transactionFinalized(receipt));

  hashCounter--;
}
