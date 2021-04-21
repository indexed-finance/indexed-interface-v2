import "./style.less";
import { AiOutlineUser } from "react-icons/ai";
import { AppErrorBoundary } from "./AppErrorBoundary";
import { AppState, selectors, store } from "features";
import { BrowserRouter, useLocation, useParams } from "react-router-dom";
import {
  Button,
  Divider,
  Layout,
  PageHeader,
  Space,
  Spin,
  Typography,
  message,
  notification,
} from "antd";
import { DEBUG, UsefulLinks } from "components";
import { FEATURE_FLAGS } from "feature-flags";
import {
  FaCoins,
  FaEthereum,
  FaFireAlt,
  FaGavel,
  FaHammer,
  FaSwimmingPool,
  FaTractor,
} from "react-icons/fa";
import {
  JazzIcon,
  LanguageSelector,
  Logo,
  ModeSwitch,
  ServerConnection,
  Token,
  WalletConnector,
} from "components";
import {
  LazyExoticComponent,
  ReactNode,
  Suspense,
  createContext,
  lazy,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, Route, useHistory } from "react-router-dom";
import { Provider } from "react-redux";
import { SOCIAL_MEDIA } from "config";
import { TransactionProvider, WalletConnectionProvider } from "./drawers";
import { Web3ReactProvider } from "@web3-react/core";
import { ethers } from "ethers";
import { noop } from "lodash";
import {
  useBreakpoints,
  usePortfolioData,
  useStakingRegistrar,
  useTranslator,
} from "hooks";
import { useSelector } from "react-redux";

export function getLibrary(_provider?: any, _connector?: any) {
  return new ethers.providers.Web3Provider(_provider);
}

export function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <AppErrorBoundary>
          <Web3ReactProvider getLibrary={getLibrary}>
            <WalletConnectionProvider>
              <TransactionProvider>
                <AppInner />
              </TransactionProvider>
            </WalletConnectionProvider>
          </Web3ReactProvider>
        </AppErrorBoundary>
      </Provider>
    </BrowserRouter>
  );
}

export function AppInner() {
  const { isMobile } = useBreakpoints();
  const inner = (
    <>
      <BrowserRouter>
        <Screen />
      </BrowserRouter>
      {FEATURE_FLAGS.useDEBUG && <DEBUG />}
    </>
  );

  // Effect:
  // Configure antd notifications and messages.
  useEffect(() => {
    message.config({
      top: isMobile ? 106 : 66,
      duration: 4.2,
    });

    notification.config({
      placement: "topRight",
      top: isMobile ? 106 : 66,
      duration: 4.2,
    });
  }, [isMobile]);

  return inner;
}

// Screen
export function Screen() {
  return (
    <Layout>
      <Layout.Header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: 60,
          background: "rgba(0, 0, 0, 0.65)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.65)",
        }}
      >
        <ScreenHeader />
      </Layout.Header>
      <SocialMediaList />
      <Layout.Content className="with-background">
        <ScreenProvider>
          <ScreenContent />
        </ScreenProvider>
      </Layout.Content>
      <TransactionList />
      <Layout.Footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100vw",
          background: "rgba(0, 0, 0, 0.65)",
          borderTop: "1px solid rgba(255, 255, 255, 0.65)",
          padding: 12,
          zIndex: 10,
        }}
      >
        <NavigationControls />
      </Layout.Footer>
    </Layout>
  );
}

export function ScreenHeader() {
  const selectedAddress = useSelector(selectors.selectUserAddress);
  const walletIcon = selectedAddress ? (
    <JazzIcon address={selectedAddress} />
  ) : (
    <WalletConnector />
  );

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
      }}
    >
      <div style={{ flex: 1 }}>
        <Logo />
      </div>
      <Space size="large" style={{ flex: 1, justifyContent: "flex-end" }}>
        <LanguageSelector />
        <ModeSwitch />
        <ServerConnection showText={true} />
        {walletIcon}
      </Space>
      <Divider
        style={{
          position: "fixed",
          top: 60,
          left: 0,
          width: "100%",
          margin: 0,
        }}
      />
    </div>
  );
}

interface ScreenContextInterface {
  adjustScreen(values: Partial<ScreenContextInterface>): void;
  title: ReactNode;
  subtitle: ReactNode;
  extra: ReactNode;
  actions: ReactNode;
  hasPageHeader: boolean;
}

const screenContextState: ScreenContextInterface = {
  adjustScreen: noop,
  title: "Foo",
  subtitle: "Bar",
  extra: null,
  actions: null,
  hasPageHeader: true,
};

const ScreenContext = createContext(screenContextState);

export function ScreenProvider({ children }: { children: ReactNode }) {
  const [
    { title, subtitle, extra, actions, hasPageHeader },
    setValues,
  ] = useState<ScreenContextInterface>(screenContextState);
  const adjustScreen = useCallback(
    (values: Partial<ScreenContextInterface>) =>
      setValues((prev) => ({
        ...prev,
        ...values,
      })),
    []
  );
  const value = useMemo(
    () => ({
      adjustScreen,
      title,
      subtitle,
      extra,
      actions,
      hasPageHeader,
    }),
    [adjustScreen, title, subtitle, extra, actions, hasPageHeader]
  );

  return (
    <ScreenContext.Provider value={value}>{children}</ScreenContext.Provider>
  );
}

export function ScreenContent() {
  const { goBack } = useHistory();
  const { title, subtitle, extra, actions, hasPageHeader } = useContext(
    ScreenContext
  );

  return (
    <div
      style={{
        background: "rgba(0, 0, 0, 0.65)",
        borderTop: "1px solid rgba(255, 255, 255, 0.65)",
        borderRight: "1px solid rgba(255, 255, 255, 0.65)",
        borderLeft: "1px solid rgba(255, 255, 255, 0.65)",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        width: "80vw",
        minHeight: "100vh",
        margin: "8rem auto 0 auto",
        padding: 24,
      }}
    >
      {hasPageHeader && (
        <>
          <Space
            style={{
              width: "100%",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <PageHeader
              onBack={goBack}
              title={
                <div style={{ marginLeft: 12 }}>
                  <Typography.Title
                    level={2}
                    style={{ margin: 0, textTransform: "uppercase" }}
                  >
                    {title}
                  </Typography.Title>
                  {subtitle && (
                    <>
                      <br />
                      <Typography.Text style={{ fontSize: 18, margin: 0 }}>
                        {subtitle}
                      </Typography.Text>
                    </>
                  )}
                </div>
              }
              style={{ color: "white" }}
            />
            {extra && <div>{extra}</div>}
          </Space>
          <Divider style={{ marginBottom: 0 }} />
        </>
      )}
      <div style={{ padding: "2rem 3rem 10rem 3rem" }}>
        <Suspense
          fallback={
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Logo withTitle={false} spinning={true} />
            </div>
          }
        >
          {routes.map((route, index) => (
            <Route
              key={index}
              exact={true}
              path={route.path}
              component={route.subscreen}
            />
          ))}
        </Suspense>
      </div>
      <Divider />
      {actions && (
        <div
          style={{
            position: "fixed",
            bottom: 77,
            left: 0,
            width: "100vw",
            height: 45,
            background: "rgba(0, 0, 0, 0.65)",
            borderTop: "1px solid rgba(255, 255, 255, 0.65)",
            display: "flex",
            alignItems: "center",
            padding: "12px 50px",
            zIndex: 1,
          }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}

// -- Subscreens
// These act as wrappers around page-specific content. The wrapper handles loading contextual content in the page header and footer.
export function Subscreen({
  adjustedValues,
  screen: SubscreenComponent,
}: {
  adjustedValues: Partial<ScreenContextInterface>;
  screen: LazyExoticComponent<() => JSX.Element>;
}) {
  const { adjustScreen } = useContext(ScreenContext);

  useEffect(() => {
    adjustScreen(adjustedValues);
  }, [adjustScreen, adjustedValues]);

  return <SubscreenComponent />;
}

const SplashSubscreen = () => {
  const adjustedValues = useMemo(
    () => ({
      hasPageHeader: false,
      actions: null,
      extra: null,
      title: "",
      subtitle: "",
    }),
    []
  );
  const SubscreenComponent = useMemo(
    () => lazy(() => import("./subscreens/Splash")),
    []
  );

  return (
    <Subscreen adjustedValues={adjustedValues} screen={SubscreenComponent} />
  );
};

const PortfolioSubscreen = () => {
  const tx = useTranslator();
  const { ndx, totalValue } = usePortfolioData();
  const adjustedValues = useMemo(
    () => ({
      hasPageHeader: true,
      actions: (
        <Space
          size="small"
          style={{ justifyContent: "space-evenly", width: "100%" }}
        >
          <div style={{ textAlign: "right" }}>
            <Token
              asAvatar={false}
              address={ndx.address}
              size="small"
              symbol={ndx.symbol}
              image="indexed-dark"
              name="Indexed"
              amount={ndx.balance}
              style={{ fontSize: 28 }}
            />
          </div>
          <span style={{ fontSize: 28 }}>
            {tx("TOTAL_VALUE")} <Divider type="vertical" />
            <Typography.Text type="success">{totalValue}</Typography.Text>
          </span>
        </Space>
      ),
      extra: null,
      title: tx("PORTFOLIO"),
      subtitle: "<fill me>",
    }),
    [tx, ndx.address, ndx.symbol, ndx.balance, totalValue]
  );
  const SubscreenComponent = useMemo(
    () => lazy(() => import("./subscreens/Portfolio")),
    []
  );

  useStakingRegistrar();

  return (
    <Subscreen adjustedValues={adjustedValues} screen={SubscreenComponent} />
  );
};

const StakingSubscreen = () => {
  const tx = useTranslator();
  const adjustedValues = useMemo(
    () => ({
      hasPageHeader: true,
      actions: null,
      extra: null,
      title: tx("LIQUIDITY_MINING"),
      subtitle: tx("STAKE_INDEX_TOKENS_..."),
    }),
    [tx]
  );
  const SubscreenComponent = useMemo(
    () => lazy(() => import("./subscreens/Staking")),
    []
  );

  return (
    <Subscreen adjustedValues={adjustedValues} screen={SubscreenComponent} />
  );
};

const PoolsSubscreen = () => {
  const tx = useTranslator();
  const adjustedValues = useMemo(
    () => ({
      hasPageHeader: true,
      actions: null,
      extra: null,
      title: tx("INDEX_POOLS"),
      subtitle: "<fill me>",
    }),
    [tx]
  );
  const SubscreenComponent = useMemo(
    () => lazy(() => import("./subscreens/Pools")),
    []
  );

  return (
    <Subscreen adjustedValues={adjustedValues} screen={SubscreenComponent} />
  );
};

const PoolSubscreen = () => {
  const { slug } = useParams<{ slug: string }>();
  const poolId = useSelector((state: AppState) =>
    selectors.selectPoolIdByName(state, slug)
  );
  const pool = useSelector((state: AppState) =>
    poolId ? selectors.selectFormattedIndexPool(state, poolId) : null
  );
  const adjustedValues = useMemo(
    () => ({
      hasPageHeader: true,
      actions: null,
      extra: pool ? <UsefulLinks address={pool.id} /> : null,
      title: pool ? (
        <Space>
          <Token
            name={pool.name}
            image={pool.name}
            symbol={pool.symbol}
            address={pool.id}
          />
          <Divider type="vertical" />
          <Typography.Text>{pool.name}</Typography.Text>
        </Space>
      ) : (
        <Spin />
      ),
      subtitle: "<fill me>",
    }),
    [pool]
  );
  const SubscreenComponent = useMemo(
    () => lazy(() => import("./subscreens/Pool")),
    []
  );

  return (
    <Subscreen adjustedValues={adjustedValues} screen={SubscreenComponent} />
  );
};

// Components
export function SocialMediaList() {
  return (
    <Space
      direction="vertical"
      style={{
        position: "fixed",
        top: 75,
        left: 0,
        width: 45,
        background: "rgba(0, 0, 0, 0.65)",
        borderTop: "1px solid rgba(255, 255, 255, 0.65)",
        borderRight: "1px solid rgba(255, 255, 255, 0.65)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.65)",
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        justifyContent: "space-evenly",
        padding: "1rem 0.25rem",
      }}
    >
      {SOCIAL_MEDIA.map((site) => (
        <a
          key={site.name}
          href={site.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Token name={site.name} image={site.image} asAvatar={true} />
        </a>
      ))}
    </Space>
  );
}

export function TransactionList() {
  return (
    <div
      style={{
        position: "fixed",
        top: 75,
        right: 0,
        width: 45,
        height: "25vh",
        background: "rgba(0, 0, 0, 0.65)",
        borderTop: "1px solid rgba(255, 255, 255, 0.65)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.65)",
        borderLeft: "1px solid rgba(255, 255, 255, 0.65)",
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
      }}
    ></div>
  );
}

export function InteractionControls() {
  return (
    <Space
      style={{
        justifyContent: "flex-end",
        width: "80vw",
        height: "100%",
      }}
    >
      <Typography.Title level={3} type="secondary" style={{ margin: 0 }}>
        Interact with CC10
      </Typography.Title>
      <Divider type="vertical" />
      <div style={{ flex: 1 }}>
        {[
          {
            title: "Trade",
            icon: <FaCoins />,
            onClick: noop,
          },
          {
            title: "Mint",
            icon: <FaHammer />,
            onClick: noop,
          },
          {
            title: "Burn",
            icon: <FaFireAlt />,
            onClick: noop,
          },
          {
            title: "Stake",
            icon: <FaTractor />,
            onClick: noop,
          },
        ].map((link) => {
          const inner = (
            <Typography.Title level={4}>
              <Space>
                <span style={{ position: "relative", top: 3 }}>
                  {link.icon}
                </span>
                <span>{link.title}</span>
              </Space>
            </Typography.Title>
          );

          return (
            <Button
              key={link.title}
              size="large"
              type="text"
              style={{ textTransform: "uppercase" }}
            >
              {inner}
            </Button>
          );
        })}
      </div>
    </Space>
  );
}

export function NavigationControls() {
  const tx = useTranslator();
  const { pathname } = useLocation();

  return (
    <Space
      style={{
        justifyContent: "space-evenly",
        width: "100%",
        height: "100%",
      }}
    >
      {[
        {
          key: "portfolio",
          title: tx("PORTFOLIO"),
          icon: <AiOutlineUser />,
          path: "/portfolio",
        },
        {
          key: "staking",
          title: tx("STAKE"),
          icon: <FaEthereum />,
          path: "/staking",
        },
        {
          key: "pools",
          title: tx("POOLS"),
          icon: <FaSwimmingPool />,
          path: "/pools",
        },
        {
          key: "govern",
          title: "GOVERN",
          icon: <FaGavel />,
          path: "https://vote.indexed.finance/",
        },
      ].map((link) => {
        const isActive = pathname.includes(link.key);
        const inner = (
          <Typography.Title level={3}>
            <Space
              style={{
                color: isActive ? "#FB1ECD" : "rgba(255,255,255,0.85)",
              }}
            >
              <span style={{ position: "relative", top: 3 }}>{link.icon}</span>
              <span>{link.title}</span>
            </Space>
          </Typography.Title>
        );

        return (
          <Button
            key={link.key}
            size="large"
            type="text"
            style={{
              textTransform: "uppercase",
              padding: "6px 10px",
              height: "auto",
              borderLeft: isActive ? "2px solid #FB1ECD" : "none",
            }}
          >
            {link.path.includes("://") ? (
              <a
                style={{ position: "relative", top: 4 }}
                href={link.path}
                rel="noopener noreferrer"
                target="_blank"
              >
                {inner}
              </a>
            ) : (
              <Link style={{ position: "relative", top: 4 }} to={link.path}>
                {inner}
              </Link>
            )}
          </Button>
        );
      })}
    </Space>
  );
}

// Routes

/**
 * Sitemap:
 *
 * / -- Splash
 * /portfolio -- User holdings of pool tokens and NDX.
 * /staking -- List of pools, stakeable and expired, with APY and other information.
 * /pools -- List of pools.
 * \> /pools/:poolId?interaction=[] -- A single pool, with an optional loaded interaction.
 */

export const routes = [
  {
    path: "/",
    subscreen: SplashSubscreen,
  },
  {
    path: "/portfolio",
    subscreen: PortfolioSubscreen,
  },
  {
    path: "/staking",
    subscreen: StakingSubscreen,
  },
  {
    path: "/pools",
    subscreen: PoolsSubscreen,
  },
  {
    path: "/pools/:slug",
    subscreen: PoolSubscreen,
  },
];
