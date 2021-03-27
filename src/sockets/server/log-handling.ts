import { actionHistory, store } from "features";
import { createServer } from "https";
import express from "express";
import fs from "fs";

export default function setupLog() {
  const LOG_CERT_PATH = process.env.LOG_CERT_PATH;
  const LOG_KEY_PATH = process.env.LOG_KEY_PATH;

  if (!(LOG_CERT_PATH && LOG_KEY_PATH)) {
    throw new Error(
      "Logging server requires environment variables LOG_CERT_PATH and LOG_KEY_PATH"
    );
  }

  const key = fs.readFileSync(LOG_KEY_PATH, "utf8");
  const cert = fs.readFileSync(LOG_CERT_PATH, "utf8");
  const credentials = { key, cert };
  const app = express();

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

  httpsServer.listen(411, () => console.info("Logger listening."));
}
