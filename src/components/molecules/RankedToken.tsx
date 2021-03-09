import { Asset } from "features";
import { CgDollar } from "react-icons/cg";
import { Token } from "components/atoms";
import { actions, selectors } from "features";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import ColorThief from "colorthief";
import Quote from "./Quote";
import React, { useEffect, useRef } from "react";
import flags from "feature-flags";
import styled from "styled-components";

export interface Props {
  token: Asset;
  rank: number;
}

export default function RankedToken({ token, rank }: Props) {
  const dispatch = useDispatch();
  const colorCache = useSelector(selectors.selectColorCache);
  const colorThief = useRef<any>(null);

  // Effect:
  // Load colorThief and generate colors based on token.
  useEffect(() => {
    if (flags.useColorThief) {
      try {
        const imageRef = document.querySelector(
          `[data-token="${token.symbol}"]`
        );
        const wrapperRef = document.querySelector(
          `[data-tokenwrapper="${token.symbol}"]`
        );
        let red = 0;
        let green = 0;
        let blue = 0;

        if (imageRef) {
          const cacheEntry = colorCache[token.id];

          if (cacheEntry) {
            const [r, g, b] = cacheEntry;

            red = r;
            green = g;
            blue = b;
          } else if (
            (imageRef as Element).clientWidth > 0 &&
            (imageRef as any).complete &&
            wrapperRef
          ) {
            colorThief.current = new ColorThief();
            const [r, g, b] = colorThief.current.getColor(imageRef);

            red = r;
            green = g;
            blue = b;

            dispatch(
              actions.tokenColorCached({
                tokenId: token.id,
                color: [red, green, blue],
              })
            );
          }

          // (wrapperRef as any).style.background = `rgba(${red}, ${green}, ${blue}, 0.15)`;
          // (wrapperRef as any).style.transition = `background 0.33s ease-in-out`;
          (wrapperRef as any).animate(
            [
              {
                background: `rgba(${red}, ${green}, ${blue}, 0.05)`,
              },
              {
                background: `rgba(${red}, ${green}, ${blue}, 0.15)`,
              },
              {
                background: `rgba(${red}, ${green}, ${blue}, 0.05)`,
              },
            ],
            {
              duration: 7000,
              easing: "ease-in-out",
              iterations: Infinity,
            }
          );
        }
      } catch {}
    }
  }, [dispatch, colorCache, token.id, token.symbol]);

  return (
    <S.Wrapper>
      <S.Rank>
        <span>#</span>
        {rank}
      </S.Rank>
      <S.RankedToken>
        <T.Top>
          <S.Left>
            <S.Token image={token.symbol} name={token.symbol} />
            <S.Title>
              <h2>{token.symbol}</h2>
              <h3>{token.name}</h3>
            </S.Title>
            <Quote
              price={token.price}
              netChange={token.netChange}
              netChangePercent={token.netChangePercent}
              isNegative={token.isNegative}
              kind="small"
            />
          </S.Left>
          <S.Right>
            <S.Weight color="blue">{token.weightPercentage}</S.Weight>
          </S.Right>
        </T.Top>
        <T.Bottom>
          <S.Balance>
            <CgDollar />
            <div>{token.balanceUsd}</div>
          </S.Balance>
          <S.Balance>
            <div>{token.balance}</div>
            <S.BalanceToken
              size="small"
              image={token.symbol}
              name={token.symbol}
              data-token={token.symbol}
            />
          </S.Balance>
        </T.Bottom>
      </S.RankedToken>
    </S.Wrapper>
  );
}

const T = {
  Top: styled.div`
    ${(props) => props.theme.snippets.spacedBetween};
    width: 100%;
  `,
  Bottom: styled.div`
    ${(props) => props.theme.snippets.spacedBetween};
    width: 100%;
  `,
};

const S = {
  Wrapper: styled.div`
    display: flex;
    align-items: flex-start;
    width: 100%;
  `,
  Rank: styled.h1`
    margin: 0;
    font-size: 30px;
    margin-right: ${(props) => props.theme.spacing.medium};

    span {
      font-size: ${(props) => props.theme.fontSizes.medium};
    }
  `,
  RankedToken: styled.div`
    ${(props) => props.theme.snippets.spacedBetween};
    flex-direction: column;
    align-items: flex-start;
    flex: 1;
  `,
  Title: styled.div`
    ${(props) => props.theme.snippets.perfectlyAligned};
    h2,
    h3 {
      margin: 0;
      ${(props) => props.theme.snippets.fancy};
    }

    h2 {
      font-size: ${(props) => props.theme.fontSizes.medium};
      margin-right: ${(props) => props.theme.spacing.small};
    }
    h3 {
      font-size: ${(props) => props.theme.fontSizes.tiny};
    }
  `,
  Balance: styled.div`
    ${(props) => props.theme.snippets.perfectlyAligned};
    font-size: ${(props) => props.theme.fontSizes.medium};
  `,
  Token: styled(Token)`
    position: absolute;
    top: 0;
    left: -55px;
    ${(props) => props.theme.snippets.imageFadedLeftRight};
    ${(props) => props.theme.snippets.size100};
  `,
  BalanceToken: styled(Token)`
    margin-left: ${(props) => props.theme.spacing.tiny};
  `,
  Weight: styled.div`
    font-size: ${(props) => props.theme.fontSizes.medium};
  `,
  Left: styled.div`
    display: flex;
    flex-direction: column;
    margin-right: ${(props) => props.theme.spacing.large};
  `,
  Right: styled.div`
    text-align: right;
    flex: 1;
  `,
  Quote: styled(Quote)`
    * {
      font-size: ${(props) => props.theme.fontSizes.small} !important;
    }
  `,
};
