import "theme/index.less";
import { BrowserRouter } from "react-router-dom";
import { DEBUGScreenSize } from "components";
import { Provider } from "react-redux";
import { notification } from "antd";
import { store } from "features";
import AppLayout from "./AppLayout";

import flags from "feature-flags";

notification.config({
  placement: "topRight",
  top: 66,
  duration: 4.2,
});

function Inner() {
  return (
    <>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
      {flags.showScreenSize && <DEBUGScreenSize />}
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Inner />
    </Provider>
  );
}
