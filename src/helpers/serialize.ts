import { abiLookup } from "ethereum/abi";
import type { AppThunk } from "features/store";
import type { InterfaceKind } from "ethereum/abi";

export type RegisteredCall = {
  interfaceKind?: InterfaceKind;
  target: string;
  function: string;
  args?: string[];
};

export type RegisteredCaller = {
  caller: string;
  onChainCalls: RegisteredCall[];
  offChainCalls: RegisteredCall[];
};

export type CallWithResult = Omit<RegisteredCall, "interface" | "args"> & {
  result?: string[];
  args?: string[];
};

export function createOnChainBatch(fromCalls: string[]) {
  return fromCalls.reduce(
    (prev, next) => {
      const [from] = next.split(": ");

      if (!prev.registrars.includes(from)) {
        prev.registrars.push(from);
        prev.callsByRegistrant[from] = [];
      }

      if (!prev.callsByRegistrant[from].includes(next)) {
        const deserialized = deserializeOnChainCall(next);

        if (deserialized) {
          prev.callsByRegistrant[from].push(next);
          prev.deserializedCalls.push(deserialized);
        }
      }

      prev.callsByRegistrant[from].push();

      return prev;
    },
    {
      registrars: [],
      callsByRegistrant: {},
      deserializedCalls: [],
    } as {
      registrars: string[];
      callsByRegistrant: Record<string, string[]>;
      deserializedCalls: RegisteredCall[];
    }
  );
}

export function serializeOnChainCall(call: RegisteredCall): string {
  return `${call.interfaceKind}/${call.target}/${call.function}/${(
    call.args ?? []
  ).join("_")}`;
}

export function deserializeOnChainCall(callId: string): null | RegisteredCall {
  try {
    const [interfaceKind, target, fn, args] = callId.split("/");
    const abi = abiLookup[interfaceKind as InterfaceKind];
    const common = {
      target,
      interface: abi,
      function: fn,
    };

    if (args) {
      return {
        ...common,
        args: args.split("_"),
      };
    } else {
      return common;
    }
  } catch (error) {
    console.error("Bad on-chain call ID", callId, error);
    return null;
  }
}

export function serializeOffChainCall(call: RegisteredCall): string {
  return `${call.function}/${(call.args ?? []).join("_")}`;
}

export function deserializeOffChainCall(
  callId: string,
  actions: Record<string, (...params: any[]) => AppThunk>
) {
  try {
    const [fn, args] = callId.split("/");
    const action = actions[fn];

    if (args) {
      const split = args.split("_");

      return action.bind(null, ...split);
    } else {
      return action;
    }
  } catch (error) {
    console.error("Bad off-chain call ID");
    return null;
  }
}
