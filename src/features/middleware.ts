import { FEATURE_FLAGS } from "feature-flags";
import { disconnectFromProvider } from "./thunks";
import { userActions } from "./user";

export function userDisconnectionMiddleware() {
  return (next: any) => (action: any) => {
    if (action.type === userActions.userDisconnected.type) {
      disconnectFromProvider();
    }

    return next(action);
  };
}

export const actionHistory: any = [];
export function trackActionMiddleware() {
  return (next: any) => (action: any) => {
    actionHistory.push(action.type);

    return next(action);
  };
}

export function molassesModeMiddleware() {
  return (next: any) => (action: any) => {
    debugger;

    return next(action);
  };
}

export const middleware = [userDisconnectionMiddleware];

if (process.env.NODE_ENV === "development") {
  middleware.push(trackActionMiddleware);

  if (FEATURE_FLAGS.useMolassesMode) {
    middleware.push(molassesModeMiddleware);
  }
}
