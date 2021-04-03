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
  useDEBUG: process.env.NODE_ENV === "development",
  useServerConnection: false,
  useMolassesMode: false,
};
