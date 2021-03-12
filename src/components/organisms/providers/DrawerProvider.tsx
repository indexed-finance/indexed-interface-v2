import { Drawer as AntDrawer, Button } from "antd";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useBreakpoints } from "helpers";
import noop from "lodash.noop";

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

export function Drawer({ page }: Props) {
  const { closeDrawerPage, modifiedActions } = useContext(DrawerContext);
  const name = page.name ?? "";
  const breakpoints = useBreakpoints();
  const allActions = modifiedActions[name]
    ? [...page.actions, ...modifiedActions[name]]
    : page.actions;

  return (
    <AntDrawer
      title={page.title}
      placement="right"
      onClose={closeDrawerPage}
      visible
      mask={page.mask ?? false}
      width={breakpoints.sm ? page.width : undefined}
      closable={page.closable ?? true}
      getContainer={false}
      footer={
        allActions.length > 0 ? (
          <Button.Group>
            {allActions.map((action) => (
              <Button
                key={action.label?.toString()}
                onClick={action.onClick}
                type={action.type ?? "default"}
                disabled={action.disabled}
              >
                {action.label}
              </Button>
            ))}
          </Button.Group>
        ) : null
      }
      footerStyle={{
        padding: 0,
        height: allActions.length > 0 ? "60px" : 0,
      }}
    >
      {page.content ?? null}
    </AntDrawer>
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
  const memoDisplayDrawerPage = useCallback(
    (page: DrawerPage, content?: ReactNode) =>
      setPages((prevPages) =>
        prevPages.concat({
          ...page,
          content,
        })
      ),
    []
  );
  const memoCloseDrawerPage = useCallback(
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
  const memoOpenDrawer = useCallback(
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
