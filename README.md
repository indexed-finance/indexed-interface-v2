# Indexed.Finance

## Repo Structure

### .storybook

Contains setup files for [Storybook](https://storybook.js.org/), a solution for viewing components without surrounding app context.

### build [.gitignore]

After building the app, the files are located here.

### cypress

Contains end-to-end test suites and set up files for [Cypress](https://www.cypress.io/), our browser integration testing engine.

### data

Contains markdown files that are compiled at build time to `src/data.json`, where it is consumed and turned into UI components.

## public

Files placed here are publicly accessible via `/<file.png>`.

## scripts

Contains scripts that modify the repository in some way. These are called from `package.json`.

## src

Contains all of the source logic for the dapp.

## webpack

Contains the configuration logic for the socket server's webpack build, as well as the minified output of the build script.
