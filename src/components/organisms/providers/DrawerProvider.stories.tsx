import { useContext } from "react";
import DrawerProvider, { DrawerContext } from "./DrawerProvider";

function Inner() {
  const { displayDrawerPage } = useContext(DrawerContext);

  return (
    <>
      <button
        onClick={() =>
          displayDrawerPage({
            width: 300,
            title: "Page A",
            content: <div>This is Page A.</div>,
            actions: [
              {
                label: "Action A",
                onClick: () => alert("Action A!"),
              },
              {
                label: "Action B",
                onClick: () => alert("Action B!"),
              },
            ],
          })
        }
      >
        Display Drawer A
      </button>
      <button
        onClick={() =>
          displayDrawerPage({
            width: 300,
            title: "Page B",
            content: <div>This is Page B.</div>,
            actions: [
              {
                label: "Action C",
                onClick: () => alert("Action C!"),
              },
              {
                label: "Action D",
                onClick: () => alert("Action D!"),
              },
            ],
          })
        }
      >
        Display Drawer B
      </button>
    </>
  );
}

export const Basic = () => {
  return (
    <DrawerProvider>
      <Inner />
    </DrawerProvider>
  );
};

export default {
  title: "Organisms/Providers/DrawerProvider",
  component: DrawerProvider,
};
