import styled from "styled-components";

interface GridProps {
  templateColumns?: string;
}

export const Grid = styled.div<GridProps>`
  display: grid;
`;

export const GridItem = styled.div``;
