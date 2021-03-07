import { Button as AntButton, ButtonProps } from "antd";
import React, { HTMLProps } from "react";
import styled, { css } from "styled-components";

export type Props = ButtonProps;

function BaseButton(props: Props) {
  return <AntButton {...props} />;
}

type WithExtras = typeof BaseButton & {
  Group: (props: ButtonGroupProps) => JSX.Element;
};

const Button = BaseButton as WithExtras;

export default Button;

// #region Variants
export type ButtonGroupProps = HTMLProps<HTMLDivElement> & {
  orientation?: "vertical" | "horizontal";
  compact?: boolean;
};

Button.Group = function ({
  orientation = "horizontal",
  compact = false,
  children,
}: ButtonGroupProps) {
  return (
    <S.Group orientation={orientation} compact={compact}>
      {children}
    </S.Group>
  );
};

// #endregion

const S = {
  Group: styled.div<ButtonGroupProps>`
    display: flex;

    ${(props) => {
      const shouldHaveSpacing = !props.compact;

      return props.orientation === "horizontal"
        ? css`
            flex-direction: row;

            ${shouldHaveSpacing &&
            css`
              button:not(:last-of-type) {
                margin-right: ${(props) => props.theme.spacing.small};
              }
            `}
          `
        : css`
            flex-direction: column;

            ${shouldHaveSpacing &&
            css`
              button:not(:last-of-type) {
                margin-bottom: ${(props) => props.theme.spacing.small};
              }
            `}
          `;
    }}
  `,
};
