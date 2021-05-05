import * as yup from "yup";
import { Alert, Button, Col, Divider, Row } from "antd";
import { Flipper, TokenSelector } from "components/atomic";
import { Formik, FormikProps, useFormikContext } from "formik";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { convert } from "helpers";
import { selectors } from "features";
import {
  useMultiTokenMintCallbacks,
  useTokenApproval,
  useTokenRandomizer,
  useTranslator,
} from "hooks";
import { useSelector } from "react-redux";
import noop from "lodash.noop";

// #region Common
type Asset = { name: string; symbol: string; id: string };

interface Props {
  assets: Asset[];
  spender: string;
  extra?: ReactNode;
  disableInputSelect?: boolean;
  disableOutputSelect?: boolean;
  defaultInputSymbol?: string;
  defaultOutputSymbol?: string;
  requiresApproval?: boolean;
  onSubmit(values: SingleInteractionValues): void;
  onChange(values: SingleInteractionValues): void | string;
}

// #endregion

// #region Single
const singleInitialValues = {
  fromToken: "",
  fromAmount: 0,
  toToken: "",
  toAmount: 0,
  lastTouchedField: "from" as "from" | "to",
};

const singleInteractionSchema = yup.object().shape({
  fromToken: yup.string().min(0, "A token is required in the 'From' field."),
  fromAmount: yup.number().min(0, "From balance must be greater than zero."),
  toToken: yup.string().min(1, "A token is required in the 'To' field."),
});

export type SingleInteractionValues = typeof singleInitialValues;

export function SingleInteraction({
  assets,
  spender,
  extra = null,
  onSubmit,
  onChange,
  defaultInputSymbol,
  defaultOutputSymbol,
  disableInputSelect,
  disableOutputSelect,
  requiresApproval = true,
}: Props) {
  const interactionRef = useRef<null | HTMLDivElement>(null);

  return (
    <div
      className="Interaction"
      ref={interactionRef}
      style={{ position: "relative" }}
    >
      <Formik
        initialValues={singleInitialValues}
        onSubmit={onSubmit}
        validationSchema={singleInteractionSchema}
      >
        {(props) => (
          <SingleInteractionInner
            {...props}
            assets={assets}
            spender={spender}
            extra={extra}
            onSubmit={onSubmit}
            onChange={onChange}
            defaultInputSymbol={defaultInputSymbol}
            defaultOutputSymbol={defaultOutputSymbol}
            disableInputSelect={disableInputSelect}
            disableOutputSelect={disableOutputSelect}
            requiresApproval={requiresApproval}
          />
        )}
      </Formik>
    </div>
  );
}

type InnerSingleProps = Omit<Props, "title"> &
  FormikProps<SingleInteractionValues>;

function SingleInteractionInner({
  spender,
  assets,
  extra,
  values,
  isValid,
  handleSubmit,
  onChange,
  setFieldValue,
  setValues,
  setFieldError,
  defaultInputSymbol,
  defaultOutputSymbol,
  disableInputSelect,
  disableOutputSelect,
  requiresApproval,
}: InnerSingleProps) {
  const tx = useTranslator();
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const { tokenId, symbol, approveAmount, rawApproveAmount } = useMemo(() => {
    if (values.fromToken && values.fromAmount) {
      const tokenIn = tokenLookup[values.fromToken.toLowerCase()];
      if (tokenIn) {
        return {
          tokenId: tokenIn.id,
          symbol: values.fromToken.toLowerCase(),
          approveAmount: values.fromAmount.toString(),
          rawApproveAmount: convert
            .toToken(values.fromAmount.toString(), tokenIn.decimals)
            .toString(10),
        };
      }
    }
    return {
      tokenId: "",
      symbol: "",
      approveAmount: "0",
      rawApproveAmount: "0",
    };
  }, [values.fromAmount, values.fromToken, tokenLookup]);
  // @todo Clean this up at some point.
  // Not doing the lookup by symbol in the hook because we already have it in scope
  const { status, approve } = useTokenApproval({
    spender,
    tokenId,
    amount: approveAmount,
    rawAmount: rawApproveAmount,
    symbol,
  });
  const inputOptions = useMemo(
    () => assets.filter(({ symbol }) => symbol !== values.toToken),
    [assets, values.toToken]
  );
  const outputOptions = useMemo(
    () => assets.filter(({ symbol }) => symbol !== values.fromToken),
    [assets, values.fromToken]
  );
  const disableFlip = disableInputSelect || disableOutputSelect;
  const handleFlip = useCallback(() => {
    if (!disableFlip) {
      const newValues = {
        fromToken: values.toToken,
        toToken: values.fromToken,
        fromAmount: values.toAmount,
        toAmount: values.fromAmount,
        lastTouchedField: values.lastTouchedField,
      };
      const error = onChange(newValues as SingleInteractionValues);
      if (error) {
        const inputErr =
          error.includes("Input") ||
          (newValues.lastTouchedField === "from" && !error.includes("Output"));

        if (inputErr) {
          setFieldError("fromAmount", error);
        } else {
          setFieldError("toAmount", error);
        }
      }
      setValues(newValues);
    }
  }, [disableFlip, values, setValues, onChange, setFieldError]);

  // Effect:
  // On initial load, select two arbitrary tokens.
  useTokenRandomizer({
    assets,
    defaultInputSymbol,
    defaultOutputSymbol,
    from: values.fromToken,
    to: values.toToken,
    changeFrom: (newFrom) => setFieldValue("fromToken", newFrom),
    changeTo: (newTo) => setFieldValue("toToken", newTo),
  });

  return (
    <Row>
      <Col span={12}>
        {/* // Fields */}
        <TokenSelector
          autoFocus={true}
          label={tx("FROM")}
          assets={inputOptions}
          value={{
            token: values.fromToken,
            amount: values.fromAmount,
          }}
          selectable={!disableInputSelect}
          onChange={({ token, amount }) => {
            const newValues = {
              ...values,
              fromToken: token || "",
              fromAmount: amount || 0,
              lastTouchedField: "from",
            } as SingleInteractionValues;
            const error = onChange(newValues);
            if (error) {
              if (error.includes("Output")) {
                setFieldError("toAmount", error);
              } else {
                setFieldError("fromAmount", error);
              }
            }
            setValues(newValues);
          }}
        />

        <Flipper disabled={disableFlip} onFlip={handleFlip} />

        <TokenSelector
          label={tx("TO")}
          assets={outputOptions}
          value={{
            token: values.toToken,
            amount: values.toAmount,
          }}
          selectable={!disableOutputSelect}
          onChange={({ token, amount }) => {
            const newValues = {
              ...values,
              toToken: token || "",
              toAmount: amount || 0,
              lastTouchedField: "to",
            } as SingleInteractionValues;
            const error = onChange(newValues);
            if (error) {
              if (error.includes("Input")) {
                setFieldError("fromAmount", error);
              } else {
                setFieldError("toAmount", error);
              }
            }
            setValues(newValues);
          }}
        />

        <Divider />

        <InteractionErrors />

        {extra}

        {requiresApproval && status === "approval needed" ? (
          <Button
            type="primary"
            style={{ width: "100%" }}
            disabled={!isValid}
            onClick={approve}
          >
            Approve
          </Button>
        ) : (
          <Button
            type="primary"
            style={{ width: "100%" }}
            disabled={!isValid || (requiresApproval && status === "unknown")}
            onClick={() => handleSubmit()}
          >
            Send
          </Button>
        )}
      </Col>
      <Col span={12}></Col>
    </Row>
  );
}

function InteractionErrors() {
  const { errors, touched } = useFormikContext<typeof singleInitialValues>();
  const formattedErrors = Object.entries(errors)
    .filter(([key]) => touched[key as keyof SingleInteractionValues])
    .map(([, value], index) => <li key={index}>{value}</li>);

  return formattedErrors.length > 0 ? (
    <>
      <Alert
        showIcon={true}
        type="error"
        message="Please fix the following issues:"
        description={<ul>{formattedErrors}</ul>}
      />
      <Divider />
    </>
  ) : null;
}

// #endregion

// #region Multi
const multiInitialValues = {
  fromToken: "",
  fromAmount: 0,
};

export type MultiInteractionValues = typeof multiInitialValues;

const multiInteractionSchema = yup.object().shape({
  fromToken: yup.string().min(0, "A token is required in the 'From' field."),
  fromAmount: yup.number().min(0, "From balance must be greater than zero."),
});

type MultiProps = Omit<Props, "onSubmit" | "onChange"> & {
  onSubmit?(values: MultiInteractionValues): void;
  onChange?(values: MultiInteractionValues): void;
};

export function MultiInteraction({
  assets,
  spender,
  extra = null,
  onSubmit = noop,
  onChange = noop,
  defaultInputSymbol,
  defaultOutputSymbol,
  disableInputSelect,
  disableOutputSelect,
  requiresApproval = true,
}: MultiProps) {
  const interactionRef = useRef<null | HTMLDivElement>(null);

  return (
    <div
      className="Interaction"
      ref={interactionRef}
      style={{ position: "relative" }}
    >
      <Formik
        initialValues={multiInitialValues}
        onSubmit={onSubmit}
        validationSchema={multiInteractionSchema}
      >
        {(props) => (
          <MultiInteractionInner
            {...props}
            assets={assets}
            spender={spender}
            extra={extra}
            onSubmit={onSubmit}
            onChange={onChange}
            defaultInputSymbol={defaultInputSymbol}
            defaultOutputSymbol={defaultOutputSymbol}
            disableInputSelect={disableInputSelect}
            disableOutputSelect={disableOutputSelect}
            requiresApproval={requiresApproval}
          />
        )}
      </Formik>
    </div>
  );
}

type InnerMultiProps = Omit<MultiProps, "title"> &
  FormikProps<MultiInteractionValues>;

function MultiInteractionInner({ spender, assets }: InnerMultiProps) {
  const tx = useTranslator();
  const tokenLookup = useSelector(selectors.selectTokenLookup);
  const { values, setFieldValue } = useFormikContext<MultiInteractionValues>();
  const tokenValue = useMemo(
    () => ({
      token: tokenLookup[spender]?.symbol ?? "",
      amount: values.fromAmount,
    }),
    [spender, tokenLookup, values.fromAmount]
  );
  const handleChange = useCallback(
    (changedValue: { token?: string; amount?: number }) => {
      if (changedValue.token) {
        setFieldValue("fromToken", changedValue.token);
      }

      if (changedValue.amount) {
        setFieldValue("fromAmount", changedValue.amount);
      }
    },
    [setFieldValue]
  );
  const [lookup, setLookup] = useState<Record<string, number>>({});
  const { calculateAmountsIn } = useMultiTokenMintCallbacks(spender);

  // Effect:
  // When the form changes, re-calculate what goes into each field.
  useEffect(() => {
    const result = calculateAmountsIn(values.fromAmount.toString());

    if (result) {
      const { tokens, amountsIn } = result;
      const formatted = tokens.reduce((prev, next, index) => {
        prev[next] = parseFloat(convert.toBalance(amountsIn[index]));
        return prev;
      }, {} as Record<string, number>);

      setLookup(formatted);
    }
  }, [calculateAmountsIn, values.fromAmount]);

  return (
    <Row gutter={12}>
      <Col span={12}>
        <TokenSelector
          assets={[]}
          label={tx("FROM")}
          selectable={false}
          value={tokenValue}
          onChange={handleChange}
        />
      </Col>
      <Col span={12}>
        <div style={{ maxHeight: 500, overflow: "auto" }}>
          {assets.map((asset) => (
            <TokenSelector
              key={asset.id}
              selectable={false}
              assets={[]}
              showBalance={false}
              value={{
                token: asset.symbol,
                amount: lookup[asset.id] ?? 0,
              }}
              error={tx("EXCEEDS_BALANCE")}
              reversed={true}
            />
          ))}
        </div>
      </Col>
    </Row>
  );
}
// #endregion
