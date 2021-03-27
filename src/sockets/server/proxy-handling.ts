import { createServer } from "https";
import express from "express";
import fs from "fs";
import httpProxy from "http-proxy";

export default function setupProxy() {
  const API_CERT_PATH = process.env.API_CERT_PATH;
  const API_KEY_PATH = process.env.API_KEY_PATH;

  if (!(API_CERT_PATH && API_KEY_PATH)) {
    throw new Error(
      "Server requires environment variables API_CERT_PATH and API_KEY_PATH"
    );
  }
  const credentials = {
    key: fs.readFileSync(API_KEY_PATH, "utf8"),
    cert: fs.readFileSync(API_CERT_PATH, "utf8"),
  };
  const proxy = httpProxy.createProxyServer({
    ssl: credentials,
    secure: true,
  });
  const app = express();

  app.get("*", (req, res) => {
    const [subdomain] = req.subdomains;

    switch (subdomain) {
      case "api-log":
        proxy.web(req, res, {
          target: "https://localhost:411",
        });
        break;
      case "api":
      default:
        proxy.web(req, res, {
          target: "https://localhost:13337",
        });
        break;
    }
  });

  const server = createServer(credentials, app);

  server.listen(443, () => console.info("Proxy server now listening on :443"));
}
