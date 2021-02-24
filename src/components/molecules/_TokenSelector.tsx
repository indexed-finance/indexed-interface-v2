import { Divider, Switch } from "antd";
import { Input } from "components/atoms";
import React from "react";
import styled, { css } from "styled-components";

type Option = {
  selected: boolean;
  amount: number;
  symbol: string;
  name: string;
};

interface Props {
  options: Option[];
  onSelectOption(option: Option): void;
  onChangeSubfield(option: Option, value: string): void;
}

export default function TokenSelector({
  options,
  onSelectOption,
  onChangeSubfield,
}: Props) {
  return (
    <>
      <S.Title orientation="left">Tokens</S.Title>
      <>
        {options.map((option, index, array) => {
          const isLast = !array[index + 1];

          return (
            <React.Fragment key={option.symbol}>
              <S.Option>
                <S.OptionLeft>
                  <S.TokenImage
                    alt={option.name}
                    title={option.name}
                    faded={!option.selected}
                    src={require(`assets/images/${option.symbol.toLowerCase()}.png`)}
                    role="button"
                    onClick={() => onSelectOption(option)}
                  />
                  <Switch
                    checked={option.selected}
                    onClick={() => onSelectOption(option)}
                  />
                </S.OptionLeft>
                <S.Amount>
                  <Input.Trade
                    label={option.symbol}
                    value={option.amount}
                    extra={option.name}
                    disabled={!option.selected}
                    onChange={(value: string | number | null | undefined) => {
                      if (value != null) {
                        onChangeSubfield(option, value.toString());
                      }
                    }}
                  />
                </S.Amount>
              </S.Option>
              {!isLast && <Divider />}
            </React.Fragment>
          );
        })}
      </>
    </>
  );
}

const S = {
  Title: styled(Divider)`
    color: ${(props) => props.theme.input.label.color};
    ${(props) => props.theme.snippets.fancy};
  `,
  Option: styled.div`
    ${(props) => props.theme.snippets.spacedBetween};
    align-items: flex-end;
    margin-bottom: ${(props) => props.theme.spacing.medium};

    ${(props) => props.theme.snippets.perfectlyAligned};

    .ant-checkbox-wrapper {
      margin-right: ${(props) => props.theme.spacing.small};
    }
  `,
  OptionLeft: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
  `,
  TokenImage: styled.img<{ faded: boolean }>`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-bottom: ${(props) => props.theme.spacing.small};
    cursor: pointer;

    ${(props) =>
      props.faded &&
      css`
        opacity: 0.5;
      `}
  `,
  Amount: styled.div`
    ${(props) => props.theme.snippets.perfectlyAligned};
  `,
};
