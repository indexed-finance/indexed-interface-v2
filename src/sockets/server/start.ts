import { log } from "./helpers";
import { setupClientHandling } from "./client-handling";
import { setupLogHandling } from "./log-handling";

log("SocketServer has started up!");

setupClientHandling();
setupLogHandling();
