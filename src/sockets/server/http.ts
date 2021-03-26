import { actionHistory, store } from "features";
import express from "express";

export default function setupHttpHandling() {
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

  app.listen(411, () => console.info("Socket HTTP server listening."));
}
