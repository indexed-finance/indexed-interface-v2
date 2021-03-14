import * as yup from "yup";
import { AiOutlineArrowRight } from "react-icons/ai";
import { Alert, Button, Divider, Space, Typography } from "antd";
import { AppState, FormattedIndexPool, actions, selectors } from "features";
import { Flipper, Token } from "components/atoms";
import { Formik, FormikProps, useFormikContext } from "formik";
import { ReactNode, useCallback, useEffect, useRef } from "react";
import { TokenSelector } from "components";
import { convert } from "helpers";
import { useDispatch, useSelector } from "react-redux";
import { useTokenRandomizer } from "./common";

interface Props {
  title: string;
  pool: FormattedIndexPool;
  extra?: ReactNode;
  onSubmit(values: typeof initialValues): void;
}

const initialValues = {
  fromToken: "",
  fromAmount: 0,
  toToken: "",
  toAmount: 0,
};

const interactionSchema = yup.object().shape({
  fromToken: yup.string().min(1, "A token is required in the 'From' field."),
  fromAmount: yup.number().positive("From balance must be greater than zero."),
  toToken: yup.string().min(1, "A token is required in the 'To' field."),
});

export type InteractionValues = typeof initialValues;

export default function BaseInteraction({
  title,
  pool,
  extra = null,
  onSubmit,
}: Props) {
  const interactionRef = useRef<null | HTMLDivElement>(null);
  const interactionParent = interactionRef.current ?? false;

  return (
    <div
      className="Interaction"
      ref={interactionRef}
      style={{ position: "relative" }}
    >
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={interactionSchema}
      >
        {(props) => (
          <>
            <Space align="center" className="spaced-between">
              <Typography.Title
                level={2}
                className="fancy no-margin-bottom"
                type="secondary"
              >
                {title}
              </Typography.Title>
              <InteractionComparison />
            </Space>
            <Divider />
            <InteractionInner
              {...props}
              pool={pool}
              extra={extra}
              parent={interactionParent}
            />
          </>
        )}
      </Formik>
    </div>
  );
}

interface InnerProps extends FormikProps<InteractionValues> {
  pool: Props["pool"];
  extra: Props["extra"];
  parent: false | HTMLDivElement;
}

function InteractionInner({
  pool,
  extra,
  parent,
  values,
  isValid,
  setFieldValue,
  handleSubmit,
}: InnerProps) {
  const dispatch = useDispatch();
  const lastTouched = useRef<null | "from" | "to">(null);
  const previousFrom = useRef("");
  const previousTo = useRef("");
  const needsApproval = useSelector((state: AppState) =>
    selectors.selectApprovalStatus(
      state,
      pool.id,
      values.fromToken.toLowerCase(),
      convert.toToken(values.fromAmount.toString()).toString(10)
    )
  );
  const handleApproval = useCallback(() => {
    if (needsApproval) {
      dispatch(
        actions.approvePool(
          pool.id,
          values.fromToken.toLowerCase(),
          values.fromAmount.toString()
        )
      );
    }
  }, [needsApproval, dispatch, pool.id, values]);

  // Effect:
  // Prevent duplicates.
  useEffect(() => {
    const { fromToken, toToken } = values;

    if (fromToken === toToken) {
      if (lastTouched.current === "from") {
        setFieldValue("toToken", previousFrom.current);
      } else {
        setFieldValue("fromToken", previousTo.current);
      }
    }

    previousFrom.current = fromToken ?? "";
    previousTo.current = toToken ?? "";
  }, [values, setFieldValue]);

  useTokenRandomizer({
    pool,
    from: values.fromToken,
    to: values.toToken,
    changeFrom: (newFrom) => setFieldValue("fromToken", newFrom),
    changeTo: (newTo) => setFieldValue("toToken", newTo),
  });

  return (
    <>
      {/* // Fields */}
      <TokenSelector
        label="From"
        assets={pool.assets}
        parent={parent}
        value={{
          token: values.fromToken,
          amount: values.fromAmount,
        }}
        onChange={(value) => {
          lastTouched.current = "from";
          setFieldValue("fromToken", value.token);
          setFieldValue("fromAmount", value.amount);
        }}
      />

      <Flipper onFlip={console.log} />

      <TokenSelector
        label="To"
        assets={pool.assets}
        parent={parent}
        value={{
          token: values.toToken,
          amount: values.toAmount,
        }}
        onChange={(value) => {
          lastTouched.current = "to";
          setFieldValue("toToken", value.token);
          setFieldValue("toAmount", value.amount);
        }}
      />

      <Divider />

      <InteractionErrors />

      {extra}

      {needsApproval ? (
        <Button
          type="primary"
          style={{ width: "100%" }}
          disabled={!isValid}
          onClick={handleApproval}
        >
          Approve
        </Button>
      ) : (
        <Button
          type="primary"
          style={{ width: "100%" }}
          disabled={!isValid}
          onClick={() => handleSubmit()}
        >
          Send
        </Button>
      )}
    </>
  );
}

// e.g. [OMG] -> [AAVE]
function InteractionComparison() {
  const { values } = useFormikContext<typeof initialValues>();
  const { fromToken, toToken } = values;

  return fromToken && toToken ? (
    <Space>
      <Token name="Baseline" image={fromToken} />
      <AiOutlineArrowRight
        style={{
          position: "relative",
          top: "4px",
          fontSize: "32px",
        }}
      />
      <Token name="Comparison" image={toToken} />
    </Space>
  ) : null;
}

function InteractionErrors() {
  const { errors, touched } = useFormikContext<typeof initialValues>();
  const formattedErrors = Object.entries(errors)
    .filter(([key]) => touched[key as keyof InteractionValues])
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
