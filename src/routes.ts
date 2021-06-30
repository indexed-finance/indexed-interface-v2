import { RouteProps } from "react-router-dom";
import { TranslatedTerm } from "helpers";
import { lazy } from "react";

type RouteWithBreadcrumbs = RouteProps & { breadcrumbName?: TranslatedTerm };

const Splash = lazy(() => import("./components/routes/Splash"));
const Portfolio = lazy(() => import("./components/routes/Portfolio"));
const Staking = lazy(() => import("./components/routes/Staking"));
const Stake = lazy(() => import("./components/routes/Stake"));
const StakeNew = lazy(() => import("./components/routes/StakeNew"));
const StakeMasterChef = lazy(
  () => import("./components/routes/StakeMasterChef")
);
const IndexPools = lazy(() => import("./components/routes/IndexPools"));
const IndexPool = lazy(() => import("./components/routes/IndexPool"));
const Vaults = lazy(() => import("./components/routes/Vaults"));
const Vault = lazy(() => import("./components/routes/Vault"));

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
    path: "/staking/:id",
    exact: true,
    component: Stake,
  },
  {
    path: "/staking-new/:id",
    exact: true,
    component: StakeNew,
  },
  {
    path: "/stake-sushi/:id",
    exact: true,
    component: StakeMasterChef,
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
  {
    path: "/index-pools/:slug/buy",
    exact: true,
    component: IndexPool,
  },
  {
    path: "/index-pools/:slug/mint",
    exact: true,
    component: IndexPool,
  },
  {
    path: "/index-pools/:slug/burn",
    exact: true,
    component: IndexPool,
  },
  {
    path: "/vaults",
    exact: true,
    component: Vaults,
  },
  {
    path: "/vaults/:slug",
    exact: true,
    component: Vault,
  },
];
