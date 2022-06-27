# Indexed.Finance

## Decentralized Index Protocol

|         |                                                                        |
| ------- | ---------------------------------------------------------------------- |
| Site    | https://indexed.finance/                                               |
| Docs    | https://docs.indexed.finance/                                          |
| Forum   | https://forum.indexed.finance/                                         |
| Twitter | https://twitter.com/ndxfi                                              |
| Discord | [Click here](https://discord.gg/jaeSTNPNt9)                            |
| Medium  | https://ndxfi.medium.com/                                              |
| Reddit  | https://reddit.com/r/indexedfinance                                    |
| YouTube | [Click here](https://www.youtube.com/channel/UCdbua6FtaiD0emvvBerKRMw) |

## Repo Structure

### .storybook

Contains setup files for [Storybook](https://storybook.js.org/), a solution for viewing components without surrounding app context.

### build [.gitignore]

After building the app, the files are located here.

### data

Contains markdown files that are compiled at build time to `src/data.json`, where it is consumed and turned into UI components.

### public

Files placed here are publicly accessible via `/<file.png>`.

### scripts

Contains scripts that modify the repository in some way. These are called from `package.json`.

### src

Contains all of the source logic for the dapp.

### webpack

Contains the configuration logic for the socket server's webpack build, as well as the minified output of the build script.

## High-Level Concepts

### Tools of Choice

| TOOL             | LEARN MORE                      | WHAT IT'S FOR                                                                           |
| ---------------- | ------------------------------- | --------------------------------------------------------------------------------------- |
| Create-React-App | https://create-react-app.dev/   | React is a view library for creating components.                                        |
| Redux            | https://redux.js.org/           | Redux is a library for handling state managements.                                      |
| React-Redux      | https://react-redux.js.org/     | React-Redux connects a React app with a Redux data store.                               |
| Redux Toolkit    | https://redux-toolkit.js.org/   | Redux Toolkit is an opinion toolset and pattern for Redux.                              |
| Ant Design       | https://ant.design/             | Ant Design is a UI framework that contains React components.                            |
| Storybook        | https://storybook.js.org/       | Storybook allows developers to view components in isolation.                            |
| Typescript       | https://www.typescriptlang.org/ | TypeScript is a superset of ECMAScript that provides a robust build-time type solution. |
| Formik           | https://formik.org/             | Formik is a form solution to make forms easier in React.                                |
| Ethers           | https://docs.ethers.io/v5/      | Ethers is an all-in-one library for interacting with the Ethereum blockchain.           |
