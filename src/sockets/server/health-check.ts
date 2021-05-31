import express from "express";

export function setupHealthChecks() {
  const app = express();

  app.get("/", (_, res) => {
    console.info("Health check: OK!");

    return res.status(200).json({
      status: "ok",
    });
  });

  app.listen(911, () => console.info("Listening for health checks."));
}
