/**
 * @remarks Foo
 * "Molasses mode" adds a debugger than triggers following every action.
 */
export const FEATURE_FLAGS = {
  useNewsLink: true,
  useFaqLink: false,
  useColorThief: false,
  useInternalDocs: false,
  usePlainLanguageTransaction: false,
  useProductionServerLocally: false,
  useSessionSaving: false,
  useFortmatic: false,
  useHomepageSteps: false,
  // useDEBUG: process.env.NODE_ENV === "development",
  useDEBUG: false,
  useServerConnection: false,
  useMolassesMode: false, // "Molasses mode"
};
