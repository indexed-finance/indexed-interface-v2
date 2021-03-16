import { IChartApi, ISeriesApi, createChart } from "lightweight-charts";
import { selectors } from "features";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import S from "string";

export interface SeriesDataItem {
  time: number;
  value: number;
}

export interface Props {
  data: SeriesDataItem[];
  expanded?: boolean;
  settings: [string, string];
}

export default function LineSeriesChart({
  data,
  expanded = false,
  settings,
}: Props) {
  const theme = useSelector(selectors.selectTheme);
  const cardRef = useRef<null | HTMLDivElement>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [series, setSeries] = useState<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    const [timeframe, key] = settings;

    chart?.applyOptions({
      watermark: {
        text: `Showing ${S(key).humanize().s} (last ${
          timeframe === "Day" ? "24h" : "week"
        })`.toUpperCase(),
      },
    });
  }, [chart, settings]);

  useEffect(() => {
    if (cardRef.current && !series) {
      const size = expanded
        ? { width: 1200, height: 500 }
        : { width: 480, height: 300 };

      const chart_ = createChart(cardRef.current, size);
      setChart(chart_);
      const options = CHART_MODES[theme];
      const lineSeries = chart_.addLineSeries({
        color: "#ECC321",
      });
      chart_.applyOptions({
        ...options,
        watermark: {
          color: "#ECC321",
          visible: true,
          text: ``,
          fontSize: 18,
          horzAlign: "left",
          vertAlign: "top",
        },
      });
      setSeries(lineSeries);
      setTimeout(() => {
        if (cardRef.current) {
          chart_.resize(
            cardRef.current.clientWidth,
            cardRef.current.clientHeight
          );
        }
      }, 250);
    }
  }, [expanded, theme, series]);

  useEffect(() => {
    if (cardRef.current && series) {
      series.setData(data as any);
    }
  }, [data, series]);

  useEffect(() => {
    if (cardRef.current && chart) {
      const [width, height] = expanded ? [1200, 500] : [400, 300];
      const options = CHART_MODES[theme];
      chart.resize(width, height);
      chart.applyOptions(options);
      setTimeout(() => {
        if (cardRef.current) {
          chart.resize(
            cardRef.current.clientWidth,
            cardRef.current.clientHeight
          );
        }
      }, 250);
    }
  }, [expanded, theme, chart]);

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
      backgroundColor: "#0A0A0A",
      textColor: "#89dce3",
    },
    priceScale: {
      borderColor: "#ECC321",
    },
    crosshair: {
      vertLine: {
        color: "#ECC321",
      },
      horzLine: {
        color: "#ECC321",
      },
    },
    grid: {
      vertLines: {
        color: "#fa79e0",
      },
      horzLines: {
        color: "#fa79e0",
      },
    },
  },
  light: {
    layout: {
      ...COMMON_LAYOUT_OPTIONS,
      backgroundColor: "white",
      textColor: "black",
    },
    grid: {
      vertLines: {
        color: "purple",
      },
      horzLines: {
        color: "purple",
      },
    },
  },
};
