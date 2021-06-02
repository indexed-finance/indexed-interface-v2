/**
 * @remarks [Molasses mode]
 * Adds a debugger than triggers following every action.
 */
export const FEATURE_FLAGS = {
  useNewsLink: true,
  useFaqLink: false,
  useColorThief: false,
  useInternalDocs: false,
  usePlainLanguageTransaction: false,
  useProductionServerLocally: true,
  useSessionSaving: true,
  useFortmatic: false,
  useHomepageSteps: false,
  useActionLogging: process.env.IS_SERVER === "true",
  useEnglishLogging: true,
  useDEBUG: process.env.NODE_ENV === "development",
  useServerConnection: true,
  useMolassesMode: false,
};
