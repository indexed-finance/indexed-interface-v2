import {
  IChartApi,
  ISeriesApi,
  MouseEventParams,
  createChart,
} from "lightweight-charts";
import { convert } from "helpers";
import { format } from "date-fns";
import { selectors } from "features";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import throttle from "lodash.throttle";

export interface SeriesDataItem {
  time: number;
  value: number;
}

interface Props {
  data: SeriesDataItem[];
  expanded?: boolean;
  onChangeTheme(): void;
  onMoveCrosshair(historical: { when: string; price: string }): void;
}

export function LineSeriesChart({
  data,
  expanded = false,
  onChangeTheme,
  onMoveCrosshair,
}: Props) {
  const theme = useSelector(selectors.selectTheme);
  const cardRef = useRef<null | HTMLDivElement>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [series, setSeries] = useState<ISeriesApi<"Line"> | null>(null);
  const lastTheme = useRef<string>(theme);

  useEffect(() => {
    if (cardRef.current && !series) {
      const size = { width: 360, height: 260 };

      const chart_ = createChart(cardRef.current, size);

      setChart(chart_);

      const options = (CHART_MODES as any)[theme];
      const lineSeries = chart_.addLineSeries({
        color: "#FC2FCE",
      });

      chart_.applyOptions(options as any);
      chart_.applyOptions({
        leftPriceScale: {
          visible: false,
        },
        rightPriceScale: {
          visible: false,
        },
        overlayPriceScales: {
          borderVisible: false,
        },
        timeScale: {
          visible: false,
        },
      });

      lineSeries.applyOptions({
        baseLineVisible: false,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      setSeries(lineSeries);
      setTimeout(() => {
        if (cardRef.current) {
          chart_.resize(
            cardRef.current.clientWidth,
            cardRef.current.clientHeight
          );
        }
      }, 0);
    }
  }, [expanded, theme, series]);

  useEffect(() => {
    if (chart && series) {
      const handleCrosshairMove = throttle((params: MouseEventParams) => {
        const price = params.seriesPrices.get(series);

        if (price) {
          const coerced = (price as unknown) as string;

          onMoveCrosshair({
            when: format((params.time as number) * 1000, "d MMMM, y HH:mm:ss"),
            price: price ? convert.toCurrency(coerced) : "",
          });
        }
      }, 100);

      chart.subscribeCrosshairMove(handleCrosshairMove);

      return () => {
        chart.unsubscribeCrosshairMove(handleCrosshairMove);
      };
    }
  }, [chart, series, onMoveCrosshair]);

  useEffect(() => {
    if (cardRef.current && series) {
      series.setData(data as any);
    }
  }, [data, series]);

  useEffect(() => {
    if (cardRef.current && chart) {
      const [width, height] = [360, 260];
      const options = (CHART_MODES as any)[theme];

      chart.resize(width, height);
      chart.applyOptions(options as any);

      setTimeout(() => {
        if (cardRef.current) {
          chart.resize(
            cardRef.current.clientWidth,
            cardRef.current.clientHeight
          );
        }
      }, 0);
    }
  }, [expanded, theme, chart]);

  useEffect(() => {
    if (theme !== lastTheme.current) {
      onChangeTheme();
    }
  }, [theme, onChangeTheme]);

  return <div ref={cardRef} />;
}

const COMMON_LAYOUT_OPTIONS = {
  fontFamily: "sans-serif",
  fontSize: 16,
};

const CHART_MODES = {
  dark: {
    layout: {
      ...COMMON_LAYOUT_OPTIONS,
      backgroundColor: "#070707",
      textColor: "#fafafa",
    },
    priceAxis: {
      position: "none",
    },
    priceScale: {
      autoScale: true,
      position: "none",
    },
    grid: {
      vertLines: {
        visible: false,
      },
      horzLines: {
        visible: false,
      },
    },
    timeScale: {
      fixLeftEdge: true,
      borderVisible: false,
      secondsVisible: false,
    },
  },
  light: {
    layout: {
      ...COMMON_LAYOUT_OPTIONS,
    },
  },
};
