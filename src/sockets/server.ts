import { store } from "features";

const state = store.getState();

console.log("default state is", JSON.stringify(state, null, 2));
