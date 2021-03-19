import { Progress as AntProgress, ProgressProps } from "antd";
import { selectors } from "features";
import { useSelector } from "react-redux";

export default function Progress(props: ProgressProps) {
  const theme = useSelector(selectors.selectTheme);
  const progressStrokeColor: any =
    theme === "outrun"
      ? {
          strokeColor: {
            "0%": "#fa79e0",
            "20%": "#14fdf9",
            "40%": "#fa79e0",
            "60%": "#14fdf9",
            "80%": "#fa79e0",
            "100%": "#14fdf9",
          },
        }
      : {};

  return <AntProgress {...props} {...progressStrokeColor} />;
}
