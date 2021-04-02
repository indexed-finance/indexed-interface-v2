import { createAction } from "@reduxjs/toolkit";

/**
 *
 */
export const restartedDueToError = createAction("restartedDueToError");

/**
 *
 */
export const mirroredServerState = createAction<any /* AppState */>(
  "mirroredServerState"
);
