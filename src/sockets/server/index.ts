import { log } from "./helpers";
import setupClientHandling from "./client-handling";
import setupLogHandling from "./log-handling";
import setupProxyHandling from "./proxy-handling";
import setupStateHandling from "./state-handling";

log("SocketServer has started up!");

setupClientHandling();
setupStateHandling();
setupLogHandling();
setupProxyHandling();
