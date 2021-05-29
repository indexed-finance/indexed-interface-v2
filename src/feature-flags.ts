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
  useProductionServerLocally: false,
  useSessionSaving: true,
  useFortmatic: false,
  useHomepageSteps: false,
  useActionLogging: process.env.IS_SERVER === "true",
  useEnglishLogging: true,
  useDEBUG: true,
  useServerConnection: true,
  useMolassesMode: false,
};
