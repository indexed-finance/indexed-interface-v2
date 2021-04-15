import "./style.less";
import { AiOutlineUser } from "react-icons/ai";
import {
  Layout as AntLayout,
  Button,
  Divider,
  PageHeader,
  Space,
  Typography,
} from "antd";
import { FaEthereum, FaGavel, FaSwimmingPool } from "react-icons/fa";
import {
  JazzIcon,
  LanguageSelector,
  Logo,
  ModeSwitch,
  ServerConnection,
  Token,
  WalletConnector,
} from "components";
import { Link, useHistory } from "react-router-dom";
import {
  Pools as PoolsPage,
  Portfolio as PortfolioPage,
  Stake as StakingPage,
} from "./pages";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { SOCIAL_MEDIA } from "config";
import { selectors } from "features";
import { useBreakpoints } from "hooks";
import { useSelector } from "react-redux";

type LayoutSize = "mobile" | "tablet" | "desktop";
const LAYOUT_SIZE_LOOKUP: Record<LayoutSize, () => JSX.Element> = {
  mobile: MobileLayout,
  tablet: TabletLayout,
  desktop: DesktopLayout,
};

export function Layout() {
  const { isMobile, xl: isDesktop } = useBreakpoints();
  const layoutSize = isMobile ? "mobile" : isDesktop ? "desktop" : "tablet";
  const LayoutSize = LAYOUT_SIZE_LOOKUP[layoutSize];

  return <LayoutSize />;
}

/**
 * @remarks Think 375x812
 * @returns JSX.Element
 */
export function MobileLayout() {
  return (
    <AntLayout>
      <AntLayout.Header style={{ height: "10vh", minHeight: 50 }}>
        <Logo />
      </AntLayout.Header>
      <AntLayout.Content style={{ height: "80vh", minHeight: 500 }}>
        <Space>Content</Space>
      </AntLayout.Content>
      <AntLayout.Footer style={{ height: "10vh", minHeight: 50 }}>
        Footer
      </AntLayout.Footer>
    </AntLayout>
  );
}

/**
 * @remarks Think 1024x768
 * @returns JSX.Element
 */
export function TabletLayout() {
  return <p>Tablet</p>;
}

/**
 * @remarks Think 1920x1080
 * @returns JSX.Element
 */
export function DesktopLayout() {
  const pageRef = useRef<any>(null);
  const pageWidth = pageRef.current?.clientWidth ?? "8rem";
  const [loadedWidth, setLoadedWidth] = useState(false);

  // Effect:
  // --
  useEffect(() => {
    if (!loadedWidth) {
      setTimeout(() => setLoadedWidth(true), 1200);
    }
  }, [loadedWidth]);

  return (
    <AntLayout className="with-background">
      <SocialMediaButtons />
      <TransactionHistory />
      <LayoutHeader />
      <AntLayout.Content>
        <div
          ref={pageRef}
          style={{
            width: "80vw",
            minWidth: 780,
            minHeight: "100vh",
            margin: "8rem auto 0 auto",
            background: "rgba(0,0,0,0.75)",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          <PageWrapper />
        </div>
      </AntLayout.Content>
      <AntLayout.Footer
        style={{
          position: "fixed",
          bottom: 0,
          left: "11rem",
          width: pageWidth,
          height: 60,
          minHeight: 50,
          background: "transparent",
          padding: 0,
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <NavigationControls />
      </AntLayout.Footer>
    </AntLayout>
  );
}

function LayoutHeader() {
  const selectedAddress = useSelector(selectors.selectUserAddress);
  const walletIcon = selectedAddress ? (
    <JazzIcon address={selectedAddress} />
  ) : (
    <WalletConnector />
  );

  return (
    <>
      <AntLayout.Header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: 60,
          background: "rgba(0,0,0,0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <Space size="large">
          <Logo />
        </Space>
        <Space size="large">
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
      </AntLayout.Header>
    </>
  );
}

interface PageContextInterface {
  title: string;
  subtitle: string;
  content: ReactNode;
}

const PageContext = createContext<PageContextInterface>({
  title: "",
  subtitle: "",
  content: "",
});

function PageProvider({ children }: { children: ReactNode }) {
  return (
    <PageContext.Provider
      value={{ title: "Title 2", subtitle: "Subtitle", content: "Content 2" }}
    >
      {children}
    </PageContext.Provider>
  );
}

function PageWrapper() {
  return (
    <PageProvider>
      <Page />
    </PageProvider>
  );
}

function Page() {
  const { goBack } = useHistory();
  const { title, subtitle, content } = useContext(PageContext);

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <PageHeader
        onBack={goBack}
        title={title}
        subTitle={subtitle}
        breadcrumb={{
          routes: [{ path: "/portfolio", breadcrumbName: "Portfolio" }],
        }}
        style={{ color: "white" }}
      />
      <Divider style={{ margin: 0 }} />
      <Space direction="vertical" style={{ width: "100%", padding: 24 }}>
        {/* <PortfolioPage /> */}
        {/* <StakingPage /> */}
        <PoolsPage />
      </Space>
    </Space>
  );
}

function SocialMediaButtons() {
  return (
    <Space
      direction="vertical"
      style={{
        position: "fixed",
        top: "12vh",
        left: 0,
        background: "rgba(0,0,0,0.75)",
        padding: "1rem",
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
      }}
    >
      {SOCIAL_MEDIA.map((site) => (
        <a
          key={site.name}
          href={site.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Token name={site.name} image={site.image} />
        </a>
      ))}
    </Space>
  );
}

function TransactionHistory() {
  return (
    <Space
      direction="vertical"
      style={{
        position: "fixed",
        top: "12vh",
        right: 0,
        background: "rgba(0,0,0,0.75)",
        padding: "1rem",
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
      }}
    >
      {SOCIAL_MEDIA.slice(2).map((site) => (
        <a
          key={site.name}
          href={site.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Token name={site.name} image={site.image} />
        </a>
      ))}
    </Space>
  );
}

function NavigationControls() {
  return (
    <Space
      style={{
        justifyContent: "space-evenly",
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.55)",
      }}
    >
      {[
        {
          title: "Portfolio",
          icon: <AiOutlineUser />,
          path: "/portfolio",
        },
        {
          title: "Staking",
          icon: <FaEthereum />,
          path: "/staking",
        },
        {
          title: "Pools",
          icon: <FaSwimmingPool />,
          path: "/pools",
        },
        {
          title: "Govern",
          icon: <FaGavel />,
          path: "https://vote.indexed.finance/",
        },
      ].map((link) => {
        const inner = (
          <Typography.Title level={3}>
            <Space>
              <span style={{ position: "relative", top: 3 }}>{link.icon}</span>
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
            {link.path.includes("://") ? (
              <a href={link.path} rel="noopener noreferrer" target="_blank">
                {inner}
              </a>
            ) : (
              <Link to={link.path}>{inner}</Link>
            )}
          </Button>
        );
      })}
    </Space>
  );
}
