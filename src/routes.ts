import { FEATURE_FLAGS } from "feature-flags";
import { RouteProps } from "react-router-dom";
import { TranslatedTerm } from "helpers";
import { lazy } from "react";

type RouteWithBreadcrumbs = RouteProps & { breadcrumbName?: TranslatedTerm };

const Splash = lazy(() => import("./components/routes/Splash"));
const Learn = lazy(() => import("./components/routes/Learn"));
const LearnArticle = lazy(() => import("./components/routes/LearnArticle"));
const IndexPools = lazy(() => import("./components/routes/IndexPools"));
const IndexPool = lazy(() => import("./components/routes/IndexPool"));
const Timelocks = lazy(() => import("./components/routes/Timelocks"));
const CreateTimelock = lazy(() => import("./components/routes/CreateTimelock"));
const TimelockWithdrawal = lazy(
  () => import("./components/routes/TimelockWithdrawal")
);

export const routes: RouteWithBreadcrumbs[] = [
  {
    path: "/",
    exact: true,
    component: Splash,
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
    path: "/timelocks",
    exact: true,
    component: Timelocks,
  },
  {
    path: "/create-timelock",
    exact: true,
    component: CreateTimelock,
  },
  {
    path: "/timelocks/:id",
    exact: true,
    component: TimelockWithdrawal,
  },
];

if (FEATURE_FLAGS.useAcademy) {
  routes.push(
    ...[
      {
        path: "/learn",
        exact: true,
        component: Learn,
      },
      {
        path: "/learn/:slug",
        exact: true,
        component: LearnArticle,
      },
    ]
  );
}
