import { AiOutlineSwap } from "react-icons/ai";
import { AppState, actions, selectors } from "features";
import { Breadcrumb, Col, Grid, Menu, Row, Typography } from "antd";
import {
  ChartCard,
  PoolDropdown,
  PoolInteractions,
  RankedTokenList,
} from "components";
import { Link, Redirect, useParams } from "react-router-dom";
import { Performance, Recent, Subscreen } from "../subscreens";
import { RiWallet3Line } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect } from "react";
import styled, { css } from "styled-components";

const { useBreakpoint } = Grid;

export default function PoolDetail() {
  const dispatch = useDispatch();
  const { poolId } = useParams<{ poolId: string }>();
  const pool = useSelector((state: AppState) =>
    selectors.selectFormattedIndexPool(state, poolId)
  );
  const isConnected = useSelector(selectors.selectConnected);
  const breakpoints = useBreakpoint();

  // Effect:
  // When the pool changes and not connected to the server, get the juicy details.
  useEffect(() => {
    if (!isConnected) {
      dispatch(actions.requestPoolDetail(poolId));
    }
  }, [dispatch, poolId, isConnected]);

  if (pool) {
    // Subscreens
    const performance = <Performance pool={pool} />;
    const chart = (
      <Subscreen icon={<AiOutlineSwap />} title="Chart" padding={0}>
        <ChartCard timeframe="1D" />
      </Subscreen>
    );
    const assets = (
      <S.Tokens icon={<AiOutlineSwap />} title="Assets" padding={0}>
        <RankedTokenList pool={pool} />
      </S.Tokens>
    );
    const interactions = (
      <Subscreen icon={<RiWallet3Line />} title="Interact" padding={0}>
        <PoolInteractions pool={pool} />
      </Subscreen>
    );
    const recents = <Recent pool={pool} />;

    // Variants
    const mobileSized = (
      <Row gutter={5}>
        <Col span={24}>{performance}</Col>
        <Col span={24}>{chart}</Col>
        <Col span={24}>{interactions}</Col>
        <Col span={24}>{assets}</Col>
        <Col span={24}>{recents}</Col>
      </Row>
    );
    const tabletSized = (
      <>
        <Row gutter={10}>
          <Col span={12}>
            {performance}
            {chart}
          </Col>
          <Col span={12}>
            {assets}
            {interactions}
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={24}>{recents}</Col>
        </Row>
      </>
    );
    const desktopSized = (
      <Row gutter={20}>
        <Col span={16}>
          <Row gutter={20}>
            <Col span={12}>
              {performance}
              {chart}
            </Col>
            <Col span={12}>{interactions}</Col>
          </Row>
          <Row gutter={20}>
            <Col span={24}>{recents}</Col>
          </Row>
        </Col>

        <Col span={8}>{assets}</Col>
      </Row>
    );

    return (
      <>
        <S.Title
          level={breakpoints.md ? 1 : 3}
          withMargin={!breakpoints.sm}
          centered={!breakpoints.sm}
        >
          <span>{pool.name}</span>
          <Breadcrumb>
            <Breadcrumb.Item overlay={<PoolDropdown />}>
              <Link to="/pools">Index Pools</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{pool.name}</Breadcrumb.Item>
          </Breadcrumb>
        </S.Title>
        {(() => {
          switch (true) {
            case breakpoints.xxl:
              return desktopSized;
            case breakpoints.xl:
              return tabletSized;
            case breakpoints.lg:
              return tabletSized;
            case breakpoints.md:
              return tabletSized;
            case breakpoints.sm:
              return tabletSized;
            case breakpoints.xs:
              return mobileSized;
          }
        })()}
      </>
    );
  } else {
    return <Redirect to="/pools" />;
  }
}

const S = {
  Tokens: styled(Subscreen)``,
  Title: styled(({ withMargin: _, centered: __, ...rest }) => (
    <Typography.Title {...rest} />
  ))<{ withMargin?: boolean; centered?: boolean }>`
    ${(props) => props.theme.snippets.spacedBetween};

    ${(props) =>
      props.withMargin &&
      css`
        margin-top: ${(props) => props.theme.spacing.medium};
      `}
    ${(props) =>
      props.centered &&
      css`
        text-align: center;
      `}
  `,
  Item: styled(Menu.Item)`
    ${(props) => props.theme.snippets.fancy};
  `,
  ItemInner: styled.div`
    ${(props) => props.theme.snippets.perfectlyAligned};
  `,
  Image: styled.img`
    ${(props) => props.theme.snippets.size32};
    margin-right: ${(props) => props.theme.spacing.medium};
  `,
};
