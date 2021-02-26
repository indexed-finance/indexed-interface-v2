import { AiOutlineSwap } from "react-icons/ai";
import { AppState, actions, selectors } from "features";
import {
  ChartCard,
  PoolInteraction,
  PoolInteractions,
  RankedTokenList,
} from "components";
import { Col, Grid, Row, Typography } from "antd";
import { Performance, Recent, Subscreen } from "../subscreens";
import { Redirect, useParams } from "react-router-dom";
import { RiWallet3Line } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";

const { useBreakpoint } = Grid;

export default function PoolDetail() {
  const dispatch = useDispatch();
  const { poolId } = useParams<{ poolId: string }>();
  const [currentInteraction, setCurrentInteraction] = useState<PoolInteraction>(
    "swap"
  );
  const pool = useSelector((state: AppState) =>
    selectors.selectFormattedIndexPool(state, poolId)
  );
  const breakpoints = useBreakpoint();

  // Effect:
  // When the pool changes, get the juicy details.
  useEffect(() => {
    dispatch(actions.requestPoolDetail(poolId));
  }, [dispatch, poolId]);

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
        <PoolInteractions
          initial={currentInteraction}
          onChange={setCurrentInteraction}
          pool={pool}
        />
      </Subscreen>
    );
    const recents = <Recent pool={pool} />;

    // Variants
    const mobileSized = (
      <>
        <Row gutter={5}>
          <Col span={24}>{performance}</Col>
          <Col span={24}>{chart}</Col>
          <Col span={24}>{assets}</Col>
          <Col span={24}>{interactions}</Col>
          <Col span={24}>{recents}</Col>
        </Row>
      </>
    );
    const tabletSized = (
      <>
        <Row gutter={10}>
          <Col span={12}>
            {performance}
            {chart}
          </Col>
          <Col span={12}>
            {interactions}
            {assets}
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={24}>{recents}</Col>
        </Row>
      </>
    );
    const desktopSized = (
      <>
        <Row gutter={20}>
          <Col span={8}>
            {performance}
            {chart}
          </Col>
          <Col span={8}>{assets}</Col>
          <Col span={8}>{interactions}</Col>
        </Row>
        <Row gutter={20}>
          <Col span={16}>{recents}</Col>
        </Row>
      </>
    );

    return (
      <>
        <S.Title
          level={breakpoints.md ? 1 : 3}
          withMargin={!breakpoints.sm}
          centered={!breakpoints.sm}
        >
          {pool.name}
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
  Tokens: styled(Subscreen)`
    max-height: 640px;
  `,
  Title: styled(({ withMargin: _, centered: __, ...rest }) => (
    <Typography.Title {...rest} />
  ))<{ withMargin?: boolean; centered?: boolean }>`
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
};
