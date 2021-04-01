import { Grid } from "antd";

const { useBreakpoint } = Grid;

export function useBreakpoints() {
  const breakpoints = useBreakpoint();

  return {
    ...breakpoints,
    isMobile: breakpoints.hasOwnProperty("md") && !breakpoints.md,
  };
}
