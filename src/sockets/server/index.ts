import { log } from "./helpers";
import setupClientHandling from "./client-handling";
import setupLogHandling from "./log-handling";
import setupProxyHandling from "./proxy-handling";
import setupStateHandling from "./state-handling";
import sslRootCAs from "ssl-root-cas/latest";

log("SocketServer has started up!");

sslRootCAs.inject();

setupClientHandling();
setupStateHandling();
setupLogHandling();
setupProxyHandling();
