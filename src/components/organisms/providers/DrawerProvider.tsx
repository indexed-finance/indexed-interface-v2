import { Drawer as AntDrawer, Grid, Menu } from "antd";
import { Button } from "components/atoms";
import React, {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import noop from "lodash.noop";
import styled, { css } from "styled-components";

export interface DrawerAction {
  label: ReactNode;
  onClick(): void;
  type?: "primary" | "default";
  disabled?: boolean;
}

interface DrawerPage {
  name?: string;
  title: ReactNode;
  width: number;
  actions: DrawerAction[];
  mask?: boolean;
  content?: ReactNode;
  closable?: boolean;
  offset?: number;
  padding?: number;
}

// #region Component
interface Props {
  page: DrawerPage;
}

const { useBreakpoint } = Grid;

export function Drawer({ page }: Props) {
  const { closeDrawerPage, modifiedActions } = useContext(DrawerContext);
  const name = page.name ?? "";
  const breakpoints = useBreakpoint();
  const allActions = modifiedActions[name]
    ? [...page.actions, ...modifiedActions[name]]
    : page.actions;
  const offset = page.offset ?? 0;
  const padding = page.padding ?? 24;

  return (
    <S.Drawer
      isMobile={!breakpoints.sm}
      title={page.title}
      placement="right"
      onClose={closeDrawerPage}
      visible
      mask={page.mask ?? false}
      width={breakpoints.sm ? page.width : undefined}
      closable={page.closable ?? true}
      getContainer={false}
      offset={offset}
      footer={
        allActions.length > 0 ? (
          <Button.Group orientation="horizontal" compact={true}>
            {allActions.map((action) => (
              <S.Button
                key={action.label?.toString()}
                onClick={action.onClick}
                type={action.type ?? "default"}
                disabled={action.disabled}
              >
                {action.label}
              </S.Button>
            ))}
          </Button.Group>
        ) : null
      }
      footerStyle={{
        padding: 0,
        height: allActions.length > 0 ? "60px" : 0,
      }}
    >
      <S.Inner padding={padding}>{page.content ?? null}</S.Inner>
    </S.Drawer>
  );
}
// #endregion

// #region Provider
interface Context {
  activePage: null | DrawerPage;
  pages: DrawerPage[];
  modifiedActions: Record<string, DrawerAction[]>;
  displayDrawerPage(page: DrawerPage, content?: ReactNode): void;
  modifyDrawerActions(pageName: string, actions: DrawerAction[]): void;
  closeDrawerPage(): void;
}

interface ProviderProps {
  children: ReactNode;
}

export const DrawerContext = createContext<Context>({
  activePage: null,
  pages: [],
  modifiedActions: {},
  displayDrawerPage: noop,
  modifyDrawerActions: noop,
  closeDrawerPage: noop,
});

export default function DrawerProvider(props: ProviderProps) {
  const [pages, setPages] = useState<DrawerPage[]>([]);
  const [modifiedActions, setModifiedActions] = useState<
    Record<string, DrawerAction[]>
  >({});
  const modifyDrawerActions = (pageName: string, actions: DrawerAction[]) =>
    setModifiedActions((prev) => ({
      ...prev,
      [pageName]: actions,
    }));
  const memoDisplayDrawerPage = React.useCallback(
    (page: DrawerPage, content?: ReactNode) =>
      setPages((prevPages) =>
        prevPages.concat({
          ...page,
          content,
        })
      ),
    []
  );
  const memoCloseDrawerPage = React.useCallback(
    () => setPages((prevPages) => prevPages.slice(0, prevPages.length - 1)),
    []
  );
  const value: Context = useMemo(
    () => ({
      modifiedActions,
      activePage: pages[0] ?? null,
      pages,
      displayDrawerPage: memoDisplayDrawerPage,
      modifyDrawerActions,
      closeDrawerPage: memoCloseDrawerPage,
    }),
    [modifiedActions, pages, memoCloseDrawerPage, memoDisplayDrawerPage]
  );

  return (
    <DrawerContext.Provider value={value}>
      {props.children}
    </DrawerContext.Provider>
  );
}
// #endregion

// #region Hooks
export function useDrawer(page: DrawerPage) {
  const { activePage, closeDrawerPage, displayDrawerPage } = useContext(
    DrawerContext
  );
  const memoOpenDrawer = React.useCallback(
    (content: ReactNode) => {
      displayDrawerPage(page, content);
    },
    [page, displayDrawerPage]
  );

  return {
    activePage,
    openDrawer: memoOpenDrawer,
    closeDrawer: closeDrawerPage,
  };
}
// #endregion

const S = {
  Drawer: styled(({ isMobile: _, ...rest }) => <AntDrawer {...rest} />)<{
    isMobile?: boolean;
    offset: number;
  }>`
    ${(props) =>
      props.isMobile
        ? css`
            position: absolute;
            right: ${props.offset}px !important;

            .ant-drawer-body {
              position: relative;
              padding: 0;
            }
          `
        : css`
            height: calc(100vh - 64px);
            top: 64px;
            z-index: 3;
          `}
  `,
  Inner: styled.div<{ padding: number }>`
    padding: ${(props) => props.padding} !important;
    padding-top: 0;
  `,
  Divider: styled.div`
    margin-top: ${(props) => props.theme.spacing.large};
  `,
  Menu: styled(Menu)`
    height: 100%;

    [role="menuitem"] {
      margin: 0 !important;
      margin-top: 0 !important;
      margin-bottom: 0 !important;
      position: relative;
      height: 100%;
    }
  `,
  MenuItem: styled(Menu.Item)`
    ${(props) => props.theme.snippets.fancy};
    text-align: center;
    background: ${(props) => props.theme.colors.white200};
    margin: 0;
  `,
  Button: styled(Button)`
    flex: 1 0 50%;
    height: 60px;
    border-radius: 0;
  `,
};
