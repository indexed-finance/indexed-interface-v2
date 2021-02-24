import "theme/typography.css";
import { Layout as AntLayout, Divider } from "antd";
import { Button } from "components/atoms";
import {
  Drawer,
  DrawerContext,
  DrawerProvider,
  ToastProvider,
} from "./providers";
import { PageFooter, PageHeader } from "components/molecules";
import { Provider, useSelector } from "react-redux";
import { SOCIAL_MEDIA } from "config";
import { selectors, store } from "features";
import { useTranslation } from "i18n";
import React, { ReactNode, useContext } from "react";
import getTheme, { GlobalStyles } from "theme";
import styled, { ThemeProvider } from "styled-components";

interface Props {
  children: ReactNode;
}

function PageLayout({ children }: Props) {
  const translate = useTranslation();
  const { activePage } = useContext(DrawerContext);

  return (
    <AntLayout>
      <S.Header>
        <PageHeader
          title={
            <S.LogoWrapper href="https://indexed.finance/">
              <S.Logo src="images/indexed-dark.png"></S.Logo> Indexed
            </S.LogoWrapper>
          }
          links={[
            {
              text: "Categories",
              route: "/categories",
            },
            {
              text: "Governance",
              route: "/governance",
            },
            {
              text: "Stake",
              route: "/stake",
            },
            {
              text: "Portfolio",
              route: "/portfolio",
            },
            {
              text: "Docs",
              route: "/docs",
            },
          ]}
        />
      </S.Header>
      <S.ContentWrapper>
        <S.Content>
          {children}
          {activePage && <Drawer page={activePage} />}
        </S.Content>
      </S.ContentWrapper>
      <PageFooter
        left={translate("ALL_RIGHTS_RESERVED")}
        right={
          <Button.Group>
            {SOCIAL_MEDIA.map((socialMedia) => (
              <Button
                key={socialMedia.name}
                type="link"
                href={socialMedia.link}
              >
                <S.SocialMediaImage src={`/images/${socialMedia.image}`} />
              </Button>
            ))}
          </Button.Group>
        }
      />
    </AntLayout>
  );
}

function Inner({ children }: Props) {
  const themeVariation = useSelector(selectors.selectTheme);
  const theme = getTheme(themeVariation);

  return (
    <ThemeProvider theme={theme}>
      <DrawerProvider>
        <ToastProvider>
          <S.Layout data-testid="layout">
            <GlobalStyles />
            <PageLayout>{children}</PageLayout>
          </S.Layout>
        </ToastProvider>
      </DrawerProvider>
    </ThemeProvider>
  );
}

export default function Layout({ children }: Props) {
  return (
    <Provider store={store}>
      <Inner>{children}</Inner>
    </Provider>
  );
}

const S = {
  Layout: styled.div`
    > section {
      min-height: 100vh;

      .ant-layout-header {
        height: 78px;
      }
    }
  `,
  Header: styled(AntLayout.Header)`
    ${(props) => props.theme.snippets.dropshadow};
  `,
  Logo: styled.img`
    width: 30px;
    height: 30px;
    margin-right: ${(props) => props.theme.spacing.medium};
  `,
  LogoWrapper: styled.a`
    ${(props) => props.theme.snippets.perfectlyAligned};

    :active,
    :hover,
    :link,
    :visited {
      color: ${(props) => props.theme.colors.white100};
    }
  `,
  ContentWrapper: styled.div`
    display: flex;
    justify-content: center;
    min-height: 80vh;
    padding: ${(props) => props.theme.spacing.huge};
  `,
  Content: styled(AntLayout.Content)`
    position: relative;
    min-width: 550px;
    padding: ${(props) => props.theme.spacing.huge};
    padding-top: 0;
    background: ${(props) => props.theme.layout.background};
    ${(props) => props.theme.snippets.dropshadow};
  `,
  SocialMediaImage: styled.img`
    width: 32px;
    height: 32px;
    border-radius: 50%;
  `,
  PageTitle: styled(Divider)`
    ${(props) => props.theme.snippets.fancy};

    span {
      font-size: ${(props) => props.theme.fontSizes.huge};
    }
  `,
};
