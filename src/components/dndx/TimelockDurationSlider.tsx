import { BigNumber, convert, duration } from "helpers";
import { Slider } from "antd";

interface Props {
  value: BigNumber;
  onChange(seconds: BigNumber): void;
}

export function TimelockDurationSlider({ value, onChange }: Props) {
  const MINIMUM = 7776000;
  const MAXIMUM = 31104000;

  return (
    <Slider
      min={MINIMUM}
      max={MAXIMUM}
      value={value.toNumber()}
      onChange={(numberValue: number) =>
        onChange(convert.toBigNumber(numberValue.toString()))
      }
      tipFormatter={(value) => (value ? duration(value) : null)}
      style={{ margin: "1rem", marginBottom: "3rem" }}
      marks={{
        7776000: (
          <>
            90d, <br /> 0x
          </>
        ),
        15550000: (
          <>
            180d, <br /> 1x
          </>
        ),
        [7776000 * 3]: (
          <>
            270d, <br /> +2x
          </>
        ),
        31104000: (
          <>
            360d, <br /> +3x
          </>
        ),
      }}
    />
  );
}
