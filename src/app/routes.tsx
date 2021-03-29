import {
  CategoryDetail,
  CategoryList,
  DocsDetail,
  DocsList,
  FAQ,
  PoolChart,
  PoolDetail,
  PoolList,
  Portfolio,
  Splash,
  Stake,
} from "./screens";
import { FiExternalLink } from "react-icons/fi";
import { GiStakeHammer } from "react-icons/gi";
import { ReactNode } from "react";
import { RiSafe2Line } from "react-icons/ri";
import flags from "feature-flags";
import type { AppState } from "features";
import type { TranslatedTerm } from "i18n";

type Route = {
  icon?: ReactNode;
  path: string;
  exact: boolean;
  sider?: TranslatedTerm | ReactNode;
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
    path: "/pools",
    exact: true,
    sider: "POOLS",
    screen: <PoolList />,
    model: "indexPools",
  },
  {
    path: "/categories",
    exact: true,
    sider: "CATEGORIES",
    screen: <CategoryList />,
    model: "categories",
  },
  {
    path: "/categories/:categoryName",
    exact: true,
    screen: <CategoryDetail />,
  },
  {
    path: "/pools/:poolName/:interaction?",
    exact: false,
    screen: <PoolDetail />,
  },
  {
    path: "/pools/:poolName/chart",
    exact: true,
    screen: <PoolChart />,
  },
  {
    icon: <RiSafe2Line />,
    path: "/portfolio",
    exact: true,
    sider: "Portfolio",
    screen: <Portfolio />,
  },
  {
    icon: <GiStakeHammer />,
    path: "/stake",
    exact: true,
    sider: "STAKE",
    screen: <Stake />,
  },
  {
    path: "/govern",
    exact: true,
    sider: (
      <ExternalLink link="https://vote.indexed.finance/" title="Governance" />
    ),
    screen: null,
    isExternalLink: true,
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
    sider: (
      <ExternalLink
        link="https://theindexedtimes.substack.com/p/coming-soon"
        title="News"
      />
    ),
    screen: null,
    isExternalLink: true,
  });
}

if (flags.useInternalDocs) {
  routes.push(
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
    }
  );
} else {
  routes.push({
    path: "/docs",
    exact: true,
    sider: <ExternalLink link="https://docs.indexed.finance/" title="Docs" />,
    screen: null,
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
