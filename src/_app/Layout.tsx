import "./style.less";
import { AiOutlineUser } from "react-icons/ai";
import { Layout as AntLayout, Button, Divider, PageHeader, Space } from "antd";
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
  return (
    <AntLayout className="with-background">
      <SocialMediaButtons />
      <TransactionHistory />
      <LayoutHeader />
      <AntLayout.Content
        style={{
          width: "80vw",
          minWidth: 780,
          height: "100vh",
          minHeight: 500,
          margin: "8rem auto 0 auto",
          background: "rgba(0,0,0,0.75)",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <Page />
      </AntLayout.Content>
      <AntLayout.Footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100vw",
          height: "20vh",
          minHeight: 50,
          background: "transparent",
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

function Page() {
  const { goBack } = useHistory();

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <PageHeader
        onBack={goBack}
        title="Title"
        subTitle="Subtitle"
        breadcrumb={{
          routes: [{ path: "/portfolio", breadcrumbName: "Portfolio" }],
        }}
        style={{ color: "white" }}
      />
      <Divider />
      <Space direction="vertical" style={{ width: "100%", padding: 24 }}>
        Content
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
      style={{ justifyContent: "space-evenly", width: "100%", height: "100%" }}
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
          <Space>
            {link.icon}
            <span>{link.title}</span>
          </Space>
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
