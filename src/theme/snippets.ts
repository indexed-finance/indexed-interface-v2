import { css } from "styled-components";

const snippets = {
  evenlySpaced: css`
    ${(props) => props.theme.snippets.perfectlyAligned};
    justify-content: space-evenly;
  `,
  perfectlyAligned: css`
    display: flex;
    align-items: center;
  `,
  perfectlyCentered: css`
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  spacedEvenly: css`
    display: flex;
    align-items: center;
    justify-content: space-evenly;
  `,
  spacedBetween: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,
  fancy: css`
    text-transform: uppercase;
    letter-spacing: 2px;
  `,
  dropshadow: css`
    -webkit-box-shadow: 5px 5px 15px 5px rgba(204, 204, 255, 0.17);
    box-shadow: 0px 0px 5px 5px rgba(204, 204, 255, 0.17);
    z-index: 1;
  `,
  imageFadedLeftRight: css`
    -webkit-mask-image: -webkit-gradient(
      linear-gradient(to bottom left, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))
    );
    mask-image: linear-gradient(
      to bottom left,
      rgba(0, 0, 0, 0.5),
      rgba(0, 0, 0, 0)
    );
  `,
  imageFadedRightLeft: css`
    -webkit-mask-image: -webkit-gradient(
      linear-gradient(to bottom right, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))
    );
    mask-image: linear-gradient(
      to bottom right,
      rgba(0, 0, 0, 0.5),
      rgba(0, 0, 0, 0)
    );
  `,
  circular: css`
    border-radius: 50%;
  `,
};

// Add sized properties for easy image sizing.
const sized = (size: number) => css`
  width: ${size}px;
  height: ${size}px;
`;
Array.from(
  {
    length: 256,
  },
  (_, index) => ((snippets as any)[`size${index + 1}`] = sized(index + 1))
);

export default snippets;
