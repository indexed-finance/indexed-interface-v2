import "theme/index.less";
import { BrowserRouter } from "react-router-dom";
import { DEBUGScreenSize } from "components";
import { Parallax } from "react-parallax";
import { Provider } from "react-redux";
import { notification } from "antd";
import { store } from "features";
import AppLayout from "./AppLayout";
import background from "assets/images/dark-bg.jpg";

import flags from "feature-flags";

notification.config({
  placement: "topRight",
  top: 66,
  duration: 4.2,
});

function Inner() {
  return (
    <Parallax bgImage={background} bgImageAlt="background" strength={400}>
      <div className="foo" />

      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
      {flags.showScreenSize && <DEBUGScreenSize />}
    </Parallax>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Inner />
    </Provider>
  );
}
