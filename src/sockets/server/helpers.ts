import { AppState } from "features";
import { FEATURE_FLAGS } from "feature-flags";

export const log = (...messages: any[]) => {
  if (FEATURE_FLAGS.useEnglishLogging) {
    console.info(`INFO) `, ...messages);
  }
};

export const formatMirrorStateResponse = (state: AppState) =>
  JSON.stringify(state);

export const formatPongResponse = () =>
  JSON.stringify({
    type: "pong",
  });
