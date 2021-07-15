import "./repo-handling";
import { log } from "./helpers";
import { setupClientHandling } from "./client-handling";
import { setupLogHandling } from "./log-handling";
import { setupStateHandling } from "./state-handling";

log("SocketServer has started up!");

export function start() {
  setupClientHandling();
  setupStateHandling();
  setupLogHandling();
}

let hasStarted = false;

if (!hasStarted) {
  hasStarted = true;
  start();
}
