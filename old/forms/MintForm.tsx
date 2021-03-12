import { Area, Input } from "components/atoms";
import { Divider, Space, Switch } from "antd";
import { FormattedIndexPool, SlippageRate, actions, selectors } from "features";
import { Link } from "gatsby";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "i18n";
import { useCallback } from "react";
import styled from "styled-components";

export default function MintForm({ pool }: { pool: FormattedIndexPool }) {
  const translate = useTranslation();
  const dispatch = useDispatch();
  const { input, slippage } = useSelector(selectors.selectFormattedMintFields);
  const handleInputChange = useCallback(
    (value: string | number | null | undefined) => {
      if (value != null) {
        dispatch(actions.changeMintField(value.toString()));
      }
    },
    [dispatch]
  );

  return (
    <S.Space direction="vertical">
      <Area>
        Provide liquidity to mint new CC10 tokens.<Link to="/">Learn more</Link>
      </Area>
      <Input.Trade
        label={translate("RECEIVE")}
        value={input.value}
        onChange={handleInputChange}
        extra={input.token}
      />
      <S.Divider orientation="left">{translate("SLIPPAGE")}</S.Divider>
      <S.SwitchGroup>
        <S.SwitchEntry>
          <Switch
            checked={slippage === SlippageRate.OnePercent}
            onClick={() =>
              dispatch(actions.mintSlippageChanged(SlippageRate.OnePercent))
            }
          />
          <h1>1%</h1>
        </S.SwitchEntry>
        <S.SwitchEntry>
          <Switch
            checked={slippage === SlippageRate.TwoPercent}
            onClick={() =>
              dispatch(actions.mintSlippageChanged(SlippageRate.TwoPercent))
            }
          />
          <h1>2%</h1>
        </S.SwitchEntry>
      </S.SwitchGroup>
    </S.Space>
  );
}

const S = {
  Space: styled(Space)`
    margin-top: ${(props) => props.theme.spacing.small};
    width: 100%;
  `,
  SwitchGroup: styled.div`
    ${(props) => props.theme.snippets.spacedEvenly};
    margin-bottom: ${(props) => props.theme.spacing.large};
    width: 100%;

    h1 {
      margin: 0;
      margin-left: ${(props) => props.theme.spacing.medium};
    }
  `,
  SwitchEntry: styled.div`
    ${(props) => props.theme.snippets.perfectlyAligned};
  `,
  Divider: styled(Divider)`
    ${(props) => props.theme.snippets.fancy};
  `,
};
