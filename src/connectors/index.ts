export const NETWORK_CHAIN_ID: number = parseInt(
  process.env.REACT_APP_CHAIN_ID ?? "1"
);

export * from "./Fortmatic";
export { default as fortmatic } from "./Fortmatic";
export { default as injected } from "./Injected";
export { default as portis } from "./Portis";
