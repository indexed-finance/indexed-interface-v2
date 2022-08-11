import { Box } from "rebass/styled-components";
import styled from "styled-components";

interface RowProps {
  width?: string;
  align?: "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
  justify?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  padding?: string;
  border?: string;
  borderRadius?: string;
}

export const Row = styled(Box)<RowProps>`
  width: ${({ width }) => width ?? "100%"};
  display: flex;
  padding: 0;
  align-items: ${({ align }) => align ?? "center"};
  justify-content: ${({ justify }) => justify ?? "flex-start"};
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
`;

export const AutoRow = styled(Row)<{ gap?: string; justify?: string }>`
  flex-wrap: wrap;
  margin: ${({ gap }) => gap && `-${gap}`};
  justify-content: ${({ justify }) => justify && justify};
  & > * {
    margin: ${({ gap }) => gap} !important;
  }
`;

export const Column = styled(Box)<{
  gap?: "sm" | "md" | "lg" | string;
  justify?:
    | "stretch"
    | "center"
    | "start"
    | "end"
    | "flex-start"
    | "flex-end"
    | "space-between";
}>`
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: ${({ gap }) =>
    (gap === "sm" && "8px") ||
    (gap === "md" && "12px") ||
    (gap === "lg" && "24px") ||
    gap};
  justify-items: ${({ justify }) => justify && justify};
`;
