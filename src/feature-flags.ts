export const FEATURE_FLAGS = {
  useProductionServerLocally: true,
  useSessionSaving: true,
  useFortmatic: true,
  useActionLogging: process.env.IS_SERVER === "true",
  useDEBUG: process.env.NODE_ENV === "development",
  /**
   * @remarks [Molasses mode]
   * Adds a debugger than triggers following every action.
   */
  useMolassesMode: false,
  useAcademy: false,
};
