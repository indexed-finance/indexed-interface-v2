import { actionHistory, store } from "features";
import { createServer } from "https";
import express from "express";
import fs from "fs";
import path from "path";

export default function setupHttpsHandling() {
  const SSL_CERT_PATH = process.env.SSL_CERT_PATH;
  const SSL_KEY_PATH = process.env.SSL_KEY_PATH;

  if (!(SSL_CERT_PATH && SSL_KEY_PATH)) {
    throw new Error(
      "Https server requires environment variables SSL_CERT_PATH and SSL_KEY_PATH"
    );
  }

  const app = express();
  const key = fs.readFileSync(path.resolve(SSL_KEY_PATH), "utf8");
  const cert = fs.readFileSync(path.resolve(SSL_CERT_PATH), "utf8");
  const credentials = { key, cert };

  app.get("/", (_, res) => {
    const actionsHtml = `
        <div>
            <h1>Action History</h1>
            <pre>
                ${JSON.stringify(actionHistory, null, 2)}
            </pre>
        </div>
    `;

    res.status(200).send(`
        <!DOCTYPE html>
        <body>
            <div>
                <h1>State</h1>
                <pre>
                    ${JSON.stringify(store.getState(), null, 2)}
                </pre>
            </div>
            ${actionsHtml}
    `);
  });

  app.get("/json", (_, res) => {
    const state = store.getState();

    return res.status(200).json({
      state,
      actionHistory,
    });
  });

  const httpsServer = createServer(credentials, app);

  httpsServer.listen(443, () => console.info("Socket HTTPS server listening."));
}
