import { Action, Performance, Recent, Subscreen } from "../subscreens";
import { AiOutlineSwap } from "react-icons/ai";
import { AppState, actions, selectors } from "features";
import { CgArrowsExpandRight } from "react-icons/cg";
import {
  ChartCard,
  PoolDropdown,
  PoolInteractions,
  RankedTokenList,
  ScreenHeader,
} from "components";
import { Col, Grid, Menu, Row } from "antd";
import { Link, Redirect, useParams } from "react-router-dom";
import { RiWallet3Line } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useMemo } from "react";
import styled from "styled-components";

const { useBreakpoint } = Grid;

export default function PoolDetail() {
  const dispatch = useDispatch();
  const { poolId } = useParams<{ poolId: string }>();
  const pool = useSelector((state: AppState) =>
    selectors.selectFormattedIndexPool(state, poolId)
  );
  const isConnected = useSelector(selectors.selectConnected);
  const breakpoints = useBreakpoint();
  const chartActions = useMemo(
    () =>
      [
        {
          type: "default",
          title: (
            <>
              Expand <CgArrowsExpandRight />
            </>
          ),
          onClick: () => {
            /* */
          },
        },
      ] as Action[],
    []
  );
  const interactionActions = useMemo(
    () =>
      [
        {
          title: "Swap",
          onClick: () => {
            /* */
          },
          type: "primary",
        },
      ] as Action[],
    []
  );

  // Effect:
  // When the pool changes and not connected to the server, get the juicy details.
  useEffect(() => {
    dispatch(actions.requestPoolUserData(poolId));

    if (isConnected) {
      dispatch(actions.requestPoolDetail(poolId));
    }
  }, [dispatch, poolId, isConnected]);

  if (pool) {
    // Subscreens
    const performance = <Performance pool={pool} />;
    const chart = (
      <Subscreen
        icon={<AiOutlineSwap />}
        title="Chart"
        padding={0}
        defaultActions={chartActions}
      >
        <ChartCard timeframe="1D" />
      </Subscreen>
    );
    const assets = (
      <S.Tokens icon={<AiOutlineSwap />} title="Assets" padding={0}>
        <RankedTokenList pool={pool} />
      </S.Tokens>
    );
    const interactions = (
      <Subscreen
        icon={<RiWallet3Line />}
        title="Interact"
        padding={0}
        defaultActions={interactionActions}
      >
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
        <ScreenHeader
          title={pool.name}
          overlay={<PoolDropdown />}
          activeBreadcrumb={<Link to="/pools">Index Pools</Link>}
        />
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
