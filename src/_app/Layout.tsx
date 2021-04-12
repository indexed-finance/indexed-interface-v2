import { Layout as AntLayout, Space } from "antd";
import { Logo } from "components";
import { useBreakpoints } from "hooks";

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
  return <p>Desktop</p>;
}
