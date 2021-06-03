/**
 * @remarks [Molasses mode]
 * Adds a debugger than triggers following every action.
 */
export const FEATURE_FLAGS = {
  useNewsLink: true,
  useProductionServerLocally: true,
  useSessionSaving: true,
  useFortmatic: true,
  useHomepageSteps: false,
  useActionLogging: process.env.IS_SERVER === "true",
  useDEBUG: process.env.NODE_ENV === "development",
  useServerConnection: true,
  useMolassesMode: false,
};
