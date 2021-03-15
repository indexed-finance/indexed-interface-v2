import {
  /*AppState, */ FormattedIndexPool,
  actions,
  selectors,
} from "features";
// import { ApprovalStatus } from "features/user/slice";
// import { COMMON_BASE_TOKENS, UNISWAP_ROUTER_ADDRESS } from "config";
// import { Trade } from "@uniswap/sdk";
import { useCallback } from "react";
import { useDispatch /*, useSelector*/ } from "react-redux";
// import { useUniswapTradingPairs } from "ethereum/helpers";
import BaseInteraction from "./BaseInteraction";

interface Props {
  pool: FormattedIndexPool;
}

export default function TradeInteraction({ pool }: Props) {
  const dispatch = useDispatch();
  // const tokenIds = useSelector((state: AppState) =>
  //   selectors.selectPoolTokenIds(state, pool.id)
  // );
  const handleApprove = useCallback(
    (spender: string, fromToken: string, fromAmount: string) =>
      dispatch(
        actions.approveSpender(
          spender,
          fromToken.toLowerCase(),
          fromAmount.toString()
        )
      ),
    [dispatch]
  );
  // const {
  //   calculateBestTradeForExactInput,
  //   calculateBestTradeForExactOutput,
  // } = useUniswapTradingPairs(tokenIds);

  //  implement below as effect

  //   const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);

  // const handleChange = useCallback(({ from, to, lastTouchedField }: TwoTokenExchangeFormValues) => {
  //   const inputToken = tokenLookup[from.token.toLowerCase()];
  //   const outputToken = tokenLookup[to.token.toLowerCase()];

  //   if (lastTouchedField === "INPUT") {
  //     const typedAmountIn = from.amount;
  //     let amountOut = 0;
  //     if (typedAmountIn) {
  //       const amountIn = convert.toToken(typedAmountIn.toString(), inputToken.decimals).toString(10);
  //       const bestTrade = calculateBestTradeForExactInput(inputToken, outputToken, amountIn);
  //       setTrade(bestTrade);
  //       amountOut = parseFloat(bestTrade?.outputAmount.toFixed(4) ?? "0");
  //     }

  return (
    <BaseInteraction
      title="Trade"
      pool={pool}
      onSubmit={console.log}
      approvalSelector={selectors.selectApprovalStatus}
      handleApprove={handleApprove}
    />
  );
}

// import { AppState, FormattedIndexPool, actions, selectors } from "features";

//
// import { convert } from "helpers";
// import { useDispatch, useSelector } from "react-redux";

// import { Button } from "antd";
// import { useTokenApproval } from "./common";
// import { useTokenUserDataListener } from "ethereum/listeners";
// import { useUniswapTradingPairs } from "ethereum/helpers";
// import React, {
//   useCallback,
//   useMemo,
//   useState,
// } from "react";
// import TwoTokenExchangeForm, { TwoTokenExchangeFormValues } from "components/organisms/TwoTokenExchangeForm";

// interface Props {
//   pool: FormattedIndexPool;
// }

// export default function TradeInteraction({ pool }: Props) {
//   const [trade, setTrade] = useState<Trade | undefined>();
//   const dispatch = useDispatch();

//   const tokenIds = useMemo(() => {
//     return [pool.id, ...COMMON_BASE_TOKENS.map((c) => c.id)];
//   }, [pool.id]);

// <<<<<<< HEAD
//   const {
//     calculateBestTradeForExactInput,
//     calculateBestTradeForExactOutput,
//   } = useUniswapTradingPairs(tokenIds);
//   const assets = useSelector((state: AppState) =>
//     selectors.selectTokensById(state, tokenIds)
//   );
// =======
//   useTokenUserDataListener(UNISWAP_ROUTER_ADDRESS, tokenIds);

//   const { calculateBestTradeForExactInput, calculateBestTradeForExactOutput } = useUniswapTradingPairs(tokenIds);
//   const assets = useSelector((state: AppState) => selectors.selectTokensById(state, tokenIds));
// >>>>>>> origin/trade
//   const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);

//   const handleChange = useCallback(({ from, to, lastTouchedField }: TwoTokenExchangeFormValues) => {
//     const inputToken = tokenLookup[from.token.toLowerCase()];
//     const outputToken = tokenLookup[to.token.toLowerCase()];

//     if (lastTouchedField === "INPUT") {
//       const typedAmountIn = from.amount;
//       let amountOut = 0;
//       if (typedAmountIn) {
//         const amountIn = convert.toToken(typedAmountIn.toString(), inputToken.decimals).toString(10);
//         const bestTrade = calculateBestTradeForExactInput(inputToken, outputToken, amountIn);
//         setTrade(bestTrade);
//         amountOut = parseFloat(bestTrade?.outputAmount.toFixed(4) ?? "0");
//       }
// <<<<<<< HEAD
//     }
//   }, [form, pool]);

//   const calculateInputForExactOutput = useCallback(
//     (changedValues: TradeValues) => {
//       const { from } = form.getFieldsValue();
//       if (!changedValues.to.token || !from.token) return;
//       let amountIn: number;
//       if (!changedValues.to.amount) {
//         amountIn = 0;
//       } else {
//         const inputToken = tokenLookup[from.token.toLowerCase()];
//         const outputToken = tokenLookup[changedValues.to.token.toLowerCase()];
//         const amountOut = convert
//           .toToken(changedValues.to.amount.toString(), outputToken.decimals)
// =======
//       to.amount = amountOut;
//     } else {
//       const typedAmountOut = to.amount;
//       let amountIn = 0;
//       if (typedAmountOut) {
//         const amountOut = convert
//           .toToken(typedAmountOut.toString(), outputToken.decimals)
// >>>>>>> origin/trade
//           .toString(10);
//         const bestTrade = calculateBestTradeForExactOutput(
//           inputToken,
//           outputToken,
//           amountOut
//         );
//         setTrade(bestTrade);
//         amountIn = parseFloat(bestTrade?.inputAmount.toFixed(4) ?? "0");
//       }
// <<<<<<< HEAD

//       form.setFieldsValue({
//         from: {
//           token: from.token,
//           amount: amountIn,
//         },
//       });
//     },
//     [calculateBestTradeForExactOutput, form, tokenLookup]
//   );

//   const calculateOutputForExactInput = useCallback(
//     (changedValues: TradeValues) => {
//       const { to } = form.getFieldsValue();
//       if (!changedValues.from.token || !to.token) return;
//       let amountOut: number;
//       if (!changedValues.from.amount) {
//         amountOut = 0;
//       } else {
//         const inputToken = tokenLookup[changedValues.from.token.toLowerCase()];
//         const outputToken = tokenLookup[to.token.toLowerCase()];
//         const amountIn = convert
//           .toToken(changedValues.from.amount.toString(), inputToken.decimals)
//           .toString(10);
//         const bestTrade = calculateBestTradeForExactInput(
//           inputToken,
//           outputToken,
//           amountIn
//         );
//         setTrade(bestTrade);
//         amountOut = parseFloat(bestTrade?.outputAmount.toFixed(4) ?? "0");
//       }
//       form.setFieldsValue({
//         to: {
//           token: to.token,
//           amount: amountOut,
//         },
//       });
//     },
//     [calculateBestTradeForExactInput, form, tokenLookup]
//   );

//   const checkAmount = (_: any, value: { amount: number }) => {
//     return value.amount > 0
//       ? Promise.resolve()
//       : Promise.reject("Amount must be greater than zero.");
//   };

//   const [price, fee, baseline, comparison] = useMemo(() => {
//     const fields = form?.getFieldsValue();
//     if (!fields || !fields.from || !fields.to) {
//       return ["0", "0", "", ""];
// =======
//       from.amount = amountIn;
//     }
//   }, [tokenLookup, calculateBestTradeForExactInput, calculateBestTradeForExactOutput]);

//   const [token, amount] = useMemo(() => {
//     if (!trade) return ["", "0"];
//     const token = trade.route.path[0].address;
//     const amount = trade.inputAmount.raw.toString(10)
//     return [token, amount];
//   }, [trade]);

//   const { status, approve } = useTokenApproval({
//     spender: UNISWAP_ROUTER_ADDRESS,
//     token,
//     amount
//   });

//   const handleSubmit = useCallback(() => {
//     if (trade) {
//       dispatch(actions.trade(trade));
// >>>>>>> origin/trade
//     }
//   }, [dispatch, trade]);

//   return <TwoTokenExchangeForm
//     title={"Trade"}
//     assetOptions={assets as any}
//     onChange={handleChange}
//     defaultInput="DAI"
//     defaultOutput={pool.symbol}
//     swapFee={0.003}
//   >
//     {
//       status === ApprovalStatus.UNKNOWN
//       ? <></>
//       : status === ApprovalStatus.APPROVED
//         ? <Button onClick={handleSubmit} type="primary"> Trade </Button>
//         : <Button onClick={approve} type="primary"> Approve </Button>
//     }
//   </TwoTokenExchangeForm>;
// }
