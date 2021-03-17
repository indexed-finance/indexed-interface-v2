import "theme/index.less";
import { BrowserRouter } from "react-router-dom";
import { DEBUGScreenSize } from "components";
import { Parallax } from "react-parallax";
import { Provider } from "react-redux";
import { message, notification } from "antd";
import { store } from "features";
import { useBreakpoints } from "helpers";
import { useEffect } from "react";
import AppLayout from "./AppLayout";
import background from "assets/images/dark-bg.jpg";
import flags from "feature-flags";

function Inner() {
  const { isMobile } = useBreakpoints();

  useEffect(() => {
    message.config({
      top: isMobile ? 106 : 66,
      duration: 4.2,
    });

    notification.config({
      placement: "topRight",
      top: isMobile ? 106 : 66,
      duration: 4.2,
    });
  }, [isMobile]);

  return (
    <Parallax bgImage={background} bgImageAlt="background" strength={200}>
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
