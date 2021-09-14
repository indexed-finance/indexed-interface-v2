import { Slider } from "antd";
import { duration } from "helpers";
import { useState } from "react";

export function TimelockDurationSlider() {
  const MINIMUM = 7776000;
  const MAXIMUM = 31104000;
  const [value, setValue] = useState(MINIMUM);

  return (
    <Slider
      min={MINIMUM}
      max={MAXIMUM}
      value={value}
      onChange={setValue}
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
