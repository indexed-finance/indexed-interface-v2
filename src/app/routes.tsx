import { FiExternalLink } from "react-icons/fi";
import { GiStakeHammer } from "react-icons/gi";
import { LazyExoticComponent, ReactElement, ReactNode } from "react";
import { RiSafe2Line } from "react-icons/ri";
import { lazy } from "react";
import flags from "feature-flags";
import type { AppState } from "features";
import type { TranslatedTerm } from "i18n";

type Route = {
  path: string;
  exact: boolean;
  icon?: ReactNode;
  sider?: TranslatedTerm | ReactNode;
  model?: keyof AppState;
  isExternalLink?: boolean;
  screen?: LazyExoticComponent<(props: any) => ReactElement>;
};

const routes: Route[] = [
  {
    path: "/",
    exact: true,
    sider: "",
    screen: lazy(() => import("./screens/Splash")),
  },
  {
    path: "/pools",
    exact: true,
    sider: "POOLS",
    screen: lazy(() => import("./screens/PoolList")),
    model: "indexPools",
  },
  {
    path: "/categories",
    exact: true,
    sider: "CATEGORIES",
    screen: lazy(() => import("./screens/CategoryList")),
    model: "categories",
  },
  {
    path: "/categories/:categoryName",
    exact: true,
    screen: lazy(() => import("./screens/CategoryDetail")),
  },
  {
    path: "/pools/:poolName/:interaction?",
    exact: false,
    screen: lazy(() => import("./screens/PoolDetail")),
  },
  {
    path: "/pools/:poolName/chart",
    exact: true,
    screen: lazy(() => import("./screens/PoolChart")),
  },
  {
    icon: <RiSafe2Line />,
    path: "/portfolio",
    exact: true,
    sider: "PORTFOLIO",
    screen: lazy(() => import("./screens/Portfolio")),
  },
  {
    icon: <GiStakeHammer />,
    path: "/stake",
    exact: true,
    sider: "STAKE",
    screen: lazy(() => import("./screens/Stake")),
  },
  {
    path: "/govern",
    exact: true,
    sider: (
      <ExternalLink link="https://vote.indexed.finance/" title="Governance" />
    ),
    isExternalLink: true,
  },
];

if (flags.showFaqLink) {
  routes.push({
    path: "/faq",
    exact: true,
    sider: "FAQ",
    screen: lazy(() => import("./screens/FAQ")),
  });
}

if (flags.showNewsLink) {
  routes.push({
    path: "/news",
    exact: true,
    sider: (
      <ExternalLink
        link="https://theindexedtimes.substack.com/p/coming-soon"
        title="News"
      />
    ),
    isExternalLink: true,
  });
}

if (flags.useInternalDocs) {
  routes.push(
    {
      path: "/docs",
      exact: true,
      sider: "Docs",
      screen: lazy(() => import("./screens/DocsList")),
    },
    {
      path: "/docs/:slug",
      exact: false,
      screen: lazy(() => import("./screens/DocsDetail")),
    }
  );
} else {
  routes.push({
    path: "/docs",
    exact: true,
    sider: <ExternalLink link="https://docs.indexed.finance/" title="Docs" />,
    isExternalLink: true,
  });
}

export default routes;

// #region Helpers
interface Props {
  link: string;
  title: string;
}

function ExternalLink(props: Props) {
  return (
    <a href={props.link} target="_blank" rel="noopener noreferrer">
      <span>{props.title}</span>
      <FiExternalLink />
    </a>
  );
}
// #endregion
