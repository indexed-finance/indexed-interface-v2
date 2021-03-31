import { getRandomEntries } from "helpers";
import { useEffect } from "react";

type Asset = { name: string; symbol: string; id: string };

// Effect:
// On initial token load, select two to swap.
export function useTokenRandomizer(options: TokenRandomizerOptions) {
  useEffect(() => {
    if (options.assets) {
      const { assets: tokens } = options;

      if (options.hasOwnProperty("from")) {
        if (!options.from && !options.to && tokens.length > 1) {
          const fromToken =
            options.defaultInputSymbol ?? getRandomEntries(1, tokens)[0].symbol;
          const toToken =
            options.defaultOutputSymbol ??
            getRandomEntries(
              1,
              tokens.filter((t) => t.symbol !== fromToken)
            )[0].symbol;

          if (options.changeFrom) {
            options.changeFrom(fromToken);
          }

          options.changeTo(toToken);

          if (options.callback) {
            options.callback();
          }
        }
      } else {
        if (!options.to && tokens.length > 0) {
          const [toToken] = getRandomEntries(1, tokens);

          options.changeTo(toToken.symbol);

          if (options.callback) {
            options.callback();
          }
        }
      }
    }
  }, [options]);
}

// #region Models
type TokenRandomizerOptions = {
  assets: Asset[];
  from?: string;
  to: string;
  defaultInputSymbol?: string;
  defaultOutputSymbol?: string;
  changeFrom?(symbol: string): void;
  changeTo(symbol: string): void;
  callback?(): void;
};
// #endregion
