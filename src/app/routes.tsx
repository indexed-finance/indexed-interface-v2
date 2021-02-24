import {
  CategoryList,
  Docs,
  FAQ,
  Govern,
  News,
  PoolDetail,
  PoolList,
  Portfolio,
  Settings,
  Splash,
  Stake,
} from "./screens";
import React, { ReactNode } from "react";
import type { AppState } from "features";

type Route = {
  path: string;
  exact: boolean;
  sider?: string;
  screen: ReactNode;
  model?: keyof AppState;
};

const routes: Route[] = [
  {
    path: "/",
    exact: true,
    sider: "",
    screen: <Splash />,
  },
  {
    path: "/portfolio",
    exact: true,
    sider: "Portfolio",
    screen: <Portfolio />,
  },
  {
    path: "/pools",
    exact: true,
    sider: "Pools",
    screen: <PoolList />,
    model: "indexPools",
  },
  {
    path: "/pools/:poolId",
    exact: true,
    screen: <PoolDetail />,
  },
  {
    path: "/categories",
    exact: true,
    sider: "Categories",
    screen: <CategoryList />,
    model: "categories",
  },
  {
    path: "/stake",
    exact: true,
    sider: "Stake",
    screen: <Stake />,
  },
  {
    path: "/govern",
    exact: true,
    sider: "Govern",
    screen: <Govern />,
  },
  {
    path: "/news",
    exact: true,
    sider: "News",
    screen: <News />,
  },
  {
    path: "/faq",
    exact: true,
    sider: "FAQ",
    screen: <FAQ />,
  },
  {
    path: "/docs",
    exact: true,
    sider: "Docs",
    screen: <Docs />,
  },
  {
    path: "/settings",
    exact: true,
    sider: "",
    screen: <Settings />,
  },
];

export default routes;
