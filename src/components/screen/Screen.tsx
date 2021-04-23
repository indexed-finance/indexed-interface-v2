import { Layout } from "antd";
import { Navigation } from "./Navigation";
import { ScreenContent } from "./ScreenContent";
import { ScreenHeader } from "./ScreenHeader";
import { ScreenProvider } from "./ScreenProvider";
import { SocialMediaList } from "./SocialMediaList";
import { TransactionList } from "./TransactionList";
import { useBreakpoints } from "hooks";

export function Screen() {
  const { isMobile } = useBreakpoints();

  return (
    <Layout>
      <Layout.Header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          background: "rgba(0, 0, 0, 0.65)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.65)",
          zIndex: 10,
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
      {isMobile && (
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
          <Navigation />
        </Layout.Footer>
      )}
    </Layout>
  );
}
