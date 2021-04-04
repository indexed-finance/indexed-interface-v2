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
let isFirstBlockNumberChange = true;
let lastBlockTime = new Date().getTime();
export function trackActionMiddleware() {
  return (next: any) => (action: any) => {
    actionHistory.push(action.type);

    if (FEATURE_FLAGS.useActionLogging) {
      if (action.type === "batcher/blockNumberChanged") {
        if (isFirstBlockNumberChange) {
          isFirstBlockNumberChange = false;
        } else {
          const now = new Date().getTime();
          const duration = ((now - lastBlockTime) / 1000).toFixed(2);
          console.info(`REDUX) [---( Lasted ${duration} seconds. )---]\n`);
          lastBlockTime = now;
        }

        console.info(`REDUX) [---( BLOCK #: ${action.payload} )---]`);
      } else {
        console.info(`REDUX) ${action.type}`);
      }
    }

    return next(action);
  };
}

export function molassesModeMiddleware() {
  return (next: any) => (action: any) => {
    debugger;

    return next(action);
  };
}

// --
export const middleware = [userDisconnectionMiddleware];

if (process.env.NODE_ENV === "development") {
  middleware.push(trackActionMiddleware);

  if (FEATURE_FLAGS.useMolassesMode) {
    middleware.push(molassesModeMiddleware);
  }
}
