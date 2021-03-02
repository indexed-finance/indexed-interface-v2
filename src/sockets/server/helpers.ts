import { AppState } from "features";
import { Operation } from "fast-json-patch";

export const log = (...messages: any[]) =>
  console.info(`Socket Server) `, ...messages);

export const formatInitialStateResponse = (state: AppState) =>
  JSON.stringify({
    kind: "INITIAL_STATE",
    data: state,
  });

export const formatStatePatchResponse = (patch: Operation[]) =>
  JSON.stringify({
    kind: "STATE_PATCH",
    data: patch,
  });

export const formatPongResponse = () =>
  JSON.stringify({
    type: "pong",
  });
