import { Asset } from "features";
import { CgDollar } from "react-icons/cg";
import { Token } from "components/atoms";
import { Typography } from "antd";
import { actions, selectors } from "features";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import ColorThief from "colorthief";
import Quote from "./Quote";
import React, { useEffect, useRef } from "react";
import flags from "feature-flags";

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
    <div>
      <Typography.Title level={3}>
        <span>#</span>
        {rank}
      </Typography.Title>
      <div>
        <div>
          <div>
            <Token
              address={token.id}
              image={token.symbol}
              name={token.symbol}
            />
            <div>
              <h2>{token.symbol}</h2>
              <h3>{token.name}</h3>
            </div>
            <Quote
              price={token.price}
              netChange={token.netChange}
              netChangePercent={token.netChangePercent}
              isNegative={token.isNegative}
              kind="small"
            />
          </div>
          <div>
            <div>{token.weightPercentage}</div>
          </div>
        </div>
        <div>
          <div>
            <CgDollar />
            <div>{token.balanceUsd}</div>
          </div>
          <div>
            <div>{token.balance}</div>
            <Token
              size="small"
              image={token.symbol}
              name={token.symbol}
              data-token={token.symbol}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
