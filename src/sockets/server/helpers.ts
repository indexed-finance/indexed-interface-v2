import { ALCHEMY_API_KEY, INFURA_ID, NETWORKS_BY_ID, SUPPORTED_NETWORKS } from "config";
import { AppState, Provider } from "features";
import { providers } from "ethers";
import fs from 'fs'
import path from 'path';

export const log = (...messages: any[]) => console.info(`INFO) `, ...messages);

export const formatMirrorStateResponse = (states: Record<number, AppState>) => JSON.stringify(states);

export const getNetworkStates = () => {
  const output: Record<number, AppState> = {};
  for (const chainId of SUPPORTED_NETWORKS) {
    const network = NETWORKS_BY_ID[chainId].name;
    const jsonState = readState(network);
    if (jsonState) {
      const state = JSON.parse(jsonState);
      output[chainId] = state;
    }
  }
  return output;
}

export const formatPongResponse = () =>
  JSON.stringify({
    type: "pong",
  });

export const getProvider = (network: string): Provider => {
  if (network === 'mainnet') {
    return new providers.InfuraProvider("mainnet", INFURA_ID);
  } else if (network === "polygon") {
    return new providers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, 137);
    //(providers.StaticJsonRpcProvider as any)(`https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, 137);
  }
  throw new Error(`Unsupported network: ${network}`)
}

export const getStatePath = (network: string): string => `./${network}.json`;//path.join(__dirname, `${network}.json`);

export const readState = (network: string): string | undefined => {
  const statePath = getStatePath(network);
  if (fs.existsSync(statePath)) return fs.readFileSync(statePath, 'utf8');
  return undefined;
}

export const writeState = (network: string, state: string) => {
  console.log(`DIR NAME: ${__dirname}`);
  const statePath = getStatePath(network);
  console.log(`PATH FOR FILE: ${statePath}`)
  fs.writeFileSync(statePath, state);
}