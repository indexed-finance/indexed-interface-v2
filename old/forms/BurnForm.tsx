import { Area, Input } from "components/atoms";
import { Link } from "gatsby";
import { Space } from "antd";
import { actions, selectors } from "features";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "i18n";
import { useCallback } from "react";
import styled from "styled-components";

export default function BurnForm() {
  const translate = useTranslation();
  const dispatch = useDispatch();
  const { input } = useSelector(selectors.selectFormattedBurnFields);
  const handleInputChange = useCallback(
    (value: string | number | null | undefined) => {
      if (value != null) {
        dispatch(actions.changeBurnField(value.toString()));
      }
    },
    [dispatch]
  );

  return (
    <S.Space direction="vertical">
      <Area>
        Redeem CC10 for one or all of the underlying assets.
        <Link to="/">Learn more</Link>
      </Area>
      <Input.Trade
        label={translate("DESTROY")}
        value={input.value}
        onChange={handleInputChange}
        extra={input.token}
      />
    </S.Space>
  );
}

const S = {
  Space: styled(Space)`
    width: 100%;
    margin-top: ${(props) => props.theme.spacing.small};
  `,
};
