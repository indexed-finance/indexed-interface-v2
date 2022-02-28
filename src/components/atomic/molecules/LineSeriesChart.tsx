import {
  ChartOptions,
  DeepPartial,
  IChartApi,
  ISeriesApi,
  MouseEventParams,
  createChart,
} from "lightweight-charts";
import { convert } from "helpers";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "hooks";
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
  const theme = useTheme();
  const cardRef = useRef<null | HTMLDivElement>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [series, setSeries] = useState<ISeriesApi<"Line"> | null>(null);
  const lastTheme = useRef<string>(theme);

  useEffect(() => {
    if (cardRef.current && !series) {
      const size = { width: 360, height: 260 };

      const options = (CHART_MODES as any)[theme];

      const chart_ = createChart(cardRef.current, {
        ...options,
        ...size
      });

      setChart(chart_);
      const lineSeries = chart_.addLineSeries({
        color: "#49ffff",
      });

      chart_.applyOptions(options as any);
      chart_.applyOptions({
        leftPriceScale: {
          visible: true,
          entireTextOnly: true,
          drawTicks: true
        },
        rightPriceScale: {
          visible: false,
        },
        overlayPriceScales: {
          borderVisible: false,
        },
        timeScale: {
          visible: true,
          timeVisible: true
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
      if (chart) {
        const timestamps = data.map(d => d.time);
        if (timestamps.length) {
          chart.timeScale().setVisibleRange({ from: Math.min(...timestamps), to: Math.max(...timestamps) } as any)
        }
      }
    }
  }, [data, chart, series]);

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

const COMMON_CHART_OPTIONS: DeepPartial<ChartOptions> = {
  leftPriceScale: {
    visible: true,
    entireTextOnly: true,
    drawTicks: true,
    alignLabels: true,
  },
  rightPriceScale: {
    visible: false,
  },
  overlayPriceScales: {
    borderVisible: false,
  },
  timeScale: {
    visible: true,
    timeVisible: true
  },
  grid: {
    vertLines: {
      visible: false,
    },
    horzLines: {
      visible: false,
    },
  },
}

const CHART_MODES = {
  dark: {
    layout: {
      ...COMMON_LAYOUT_OPTIONS,
      backgroundColor: "#151515",
      textColor: "#fafafa",
    },
    ...COMMON_CHART_OPTIONS
  },
  light: {
    layout: {
      ...COMMON_LAYOUT_OPTIONS,
    },
    ...COMMON_CHART_OPTIONS
  },
};
