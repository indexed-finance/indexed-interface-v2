import { Area, Flipper, Input, Panel } from "components/atoms";
import { Link } from "gatsby";
import { Space } from "antd";
import { actions, selectors } from "features";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "i18n";

import styled from "styled-components";

export default function SwapForm() {
  const translate = useTranslation();
  const dispatch = useDispatch();
  const { input, output } = useSelector(selectors.selectFormattedSwapFields);
  const swapFee = useSelector(selectors.selectSwapFee);
  const [handleInputChange, handleOutputChange] = ["input", "output"].map(
    (side) => (value: string | number | null | undefined) => {
      if (value != null) {
        dispatch(
          actions.changeSwapField(side as "input" | "output", value.toString())
        );
      }
    }
  );

  return (
    <S.Space direction="vertical">
      <Area>
        (swap description)
        <Link to="/">Learn more</Link>
      </Area>
      <Input.Trade
        label={translate("INPUT")}
        value={input.value}
        onChange={handleInputChange}
        extra={<>Balance: 13.37 {input.token}</>}
      />
      <Flipper onFlip={() => dispatch(actions.flipSwapFields())} />
      <Input.Trade
        label={translate("OUTPUT")}
        value={output.value}
        onChange={handleOutputChange}
        extra={<>Balance: 69.42 {output.token}</>}
      />
      <Panel.Rate from={input.token} rate={3.14} to={output.token} />
      <Panel.Fee amount={swapFee} token={output.token} />
    </S.Space>
  );
}

const S = {
  Space: styled(Space)`
    margin-top: ${(props) => props.theme.spacing.small};
    width: 100%;
  `,
};
