import { Grid } from "antd";

const { useBreakpoint } = Grid;

export default function useBreakpoints() {
  const breakpoints = useBreakpoint();

  return breakpoints;
}
