import { AppState } from "features";

export const log = (...messages: any[]) => console.info(`INFO) `, ...messages);

export const formatMirrorStateResponse = (state: AppState) =>
  JSON.stringify(state);

export const formatPongResponse = () =>
  JSON.stringify({
    type: "pong",
  });
