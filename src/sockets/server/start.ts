import { log } from "./helpers";
import { setupClientHandling } from "./client-handling";
import { setupHealthChecks } from "./health-check";
import { setupLogHandling } from "./log-handling";
import { setupProxy } from "./proxy-handling";
import { setupStateHandling } from "./state-handling";

log("SocketServer has started up!");

setupClientHandling();
setupStateHandling();
setupLogHandling();
// setupProxy();
setupHealthChecks();
