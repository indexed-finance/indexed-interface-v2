import { log } from "./helpers";
import setupClientHandling from "./client-handling";
import setupStateHandling from "./state-handling";

log("SocketServer has started up!");

setupClientHandling();
setupStateHandling();
