import { RouteProps } from "react-router-dom";
import { TranslatedTerm } from "helpers";
import { lazy } from "react";

type RouteWithBreadcrumbs = RouteProps & { breadcrumbName?: TranslatedTerm };

const Splash = lazy(() => import("./components/routes/Splash"));
const Portfolio = lazy(() => import("./components/routes/Portfolio"));
const Staking = lazy(() => import("./components/routes/Staking"));
const IndexPools = lazy(() => import("./components/routes/IndexPools"));
const IndexPool = lazy(() => import("./components/routes/IndexPool"));

export const routes: RouteWithBreadcrumbs[] = [
  {
    path: "/",
    exact: true,
    component: Splash,
  },
  {
    path: "/portfolio",
    breadcrumbName: "PORTFOLIO",
    exact: true,
    component: Portfolio,
  },
  {
    path: "/staking",
    breadcrumbName: "STAKE",
    exact: true,
    component: Staking,
  },
  {
    path: "/index-pools",
    breadcrumbName: "INDEX_POOLS",
    exact: true,
    component: IndexPools,
  },
  {
    path: "/index-pools/:slug",
    exact: true,
    component: IndexPool,
  },
];
