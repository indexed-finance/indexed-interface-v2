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
            90d, <br /> 1.0x
          </>
        ),
        19476000: (
          <>
            225d, <br /> 2.0x
          </>
        ),
        31104000: (
          <>
            360d, <br /> 3.0x
          </>
        ),
      }}
    />
  );
}
