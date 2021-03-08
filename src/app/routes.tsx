import {
  CategoryDetail,
  CategoryList,
  DocsDetail,
  DocsList,
  FAQ,
  NewsDetail,
  NewsList,
  PoolDetail,
  PoolList,
  Portfolio,
  Settings,
  Splash,
  Stake,
} from "./screens";
import React, { ReactNode } from "react";
import flags from "feature-flags";
import type { AppState } from "features";

type Route = {
  path: string;
  exact: boolean;
  sider?: ReactNode;
  screen: ReactNode;
  model?: keyof AppState;
  isExternalLink?: boolean;
};

const routes: Route[] = [
  {
    path: "/",
    exact: true,
    sider: "",
    screen: <Splash />,
  },
  {
    path: "/categories",
    exact: true,
    sider: "Categories",
    screen: <CategoryList />,
    model: "categories",
  },
  {
    path: "/categories/:categoryId",
    exact: true,
    screen: <CategoryDetail />,
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
    path: "/portfolio",
    exact: true,
    sider: "Portfolio",
    screen: <Portfolio />,
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
    sider: (
      <a
        href="https://vote.indexed.finance/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Governance
      </a>
    ),
    screen: null,
    isExternalLink: true,
  },
  {
    path: "/news/:slug",
    exact: true,
    screen: <NewsDetail />,
  },
  {
    path: "/docs",
    exact: true,
    sider: "Docs",
    screen: <DocsList />,
  },
  {
    path: "/docs/:slug",
    exact: false,
    screen: <DocsDetail />,
  },
  {
    path: "/settings",
    exact: true,
    sider: "",
    screen: <Settings />,
  },
];

if (flags.showFaqLink) {
  routes.push({
    path: "/faq",
    exact: true,
    sider: "FAQ",
    screen: <FAQ />,
  });
}

if (flags.showNewsLink) {
  routes.push({
    path: "/news",
    exact: true,
    sider: "News",
    screen: <NewsList />,
  });
}

export default routes;
