import { AppState, selectors } from "features";
import { Breadcrumb, Divider, Grid, Menu, Typography } from "antd";
import { CategoryTable } from "components";
import { Link } from "react-router-dom";
import { Redirect, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import React from "react";
import ReactMarkdown from "react-markdown";
import styled, { css } from "styled-components";

const { useBreakpoint } = Grid;

export default function CategoryDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = useSelector((state: AppState) =>
    selectors.selectFormattedCategory(state, categoryId)
  );
  const { categories } = useSelector(selectors.selectMenuModels);
  const breakpoints = useBreakpoint();

  return category ? (
    <>
      <S.Title
        level={breakpoints.md ? 1 : 3}
        withMargin={!breakpoints.sm}
        centered={!breakpoints.sm}
      >
        <span>{category.name}</span>
        <Breadcrumb>
          <Breadcrumb.Item
            overlay={
              <Menu>
                <Menu>
                  {categories.map(({ id, name }) => {
                    return (
                      <Menu.Item key={id}>
                        <S.ItemInner>
                          <S.CategoryId level={3} data-category={true}>
                            {id}
                          </S.CategoryId>
                          <span>{name}</span>
                        </S.ItemInner>
                      </Menu.Item>
                    );
                  })}
                </Menu>
              </Menu>
            }
          >
            <Link to="/categories">Categories</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{category.name}</Breadcrumb.Item>
        </Breadcrumb>
      </S.Title>
      <CategoryTable {...category} />
      <Divider />
      <ReactMarkdown>{category.description}</ReactMarkdown>
    </>
  ) : (
    <Redirect to="/categories" />
  );
}

const S = {
  Title: styled(({ withMargin: _, centered: __, ...rest }) => (
    <Typography.Title {...rest} />
  ))<{ withMargin?: boolean; centered?: boolean }>`
    ${(props) => props.theme.snippets.spacedBetween};

    ${(props) =>
      props.withMargin &&
      css`
        margin-top: ${(props) => props.theme.spacing.huge};
      `}
    ${(props) =>
      props.centered &&
      css`
        text-align: center;
      `}
  `,
  CategoryId: styled(Typography.Title)`
    position: relative;
    left: 9px;
    opacity: 0.2;
    text-transform: lowercase;

    transition: color 0.6s linear;
  `,
  ItemInner: styled.div<{ isCategory?: boolean }>`
    ${(props) => props.theme.snippets.perfectlyAligned};

    :hover {
      [data-category="true"] {
        opacity: 0.6;
        color: #ccccff;
      }
    }
  `,
};
