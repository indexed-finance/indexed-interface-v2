import { Area, Flipper, Input } from "components/atoms";
import { Link } from "gatsby";
import { Space } from "antd";
import { actions, selectors } from "features";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "i18n";

import styled from "styled-components";

export default function TradeForm() {
  const translate = useTranslation();
  const dispatch = useDispatch();
  const { input, output } = useSelector(selectors.selectFormattedTradeFields);
  const [handleInputChange, handleOutputChange] = ["input", "output"].map(
    (side) => (value: string | number | null | undefined) => {
      if (value != null) {
        dispatch(
          actions.changeTradeField(side as "input" | "output", value.toString())
        );
      }
    }
  );

  return (
    <S.Space direction="vertical">
      <Area>
        (trade description)
        <Link to="/">Learn more</Link>
      </Area>
      <Input.Trade
        label={translate("SEND")}
        value={input.value}
        onChange={handleInputChange}
        extra={input.token}
      />
      <Flipper onFlip={() => dispatch(actions.flipTradeFields())} />
      <Input.Trade
        label={translate("RECEIVE")}
        value={output.value}
        onChange={handleOutputChange}
        extra={output.token}
      />
    </S.Space>
  );
}

const S = {
  Space: styled(Space)`
    margin-top: ${(props) => props.theme.spacing.small};
    width: 100%;
  `,
};
