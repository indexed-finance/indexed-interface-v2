import "./styles.less";
import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`
  * {
      font-family: "San Francisco Bold", sans-serif;
  }
  
  body {
    overflow-x: hidden;
  }

  .ant-message {
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
  }
`;
