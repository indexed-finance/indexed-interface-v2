import "./styles.css";
import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`
  * {
      font-family: "San Francisco Bold", sans-serif;
  }
  html,
  body {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .ant-message {
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
  }
`;
