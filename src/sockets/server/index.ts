import { log } from "./helpers";
import setupClientHandling from "./client-handling";
import setupHttpHandling from "./http";
import setupStateHandling from "./state-handling";

log("SocketServer has started up!");

setupClientHandling();
setupStateHandling();
setupHttpHandling();
