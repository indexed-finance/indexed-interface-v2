import express from "express";

export function setupHealthChecks() {
  const app = express();

  app.get("/", (_, res) =>
    res.status(200).json({
      status: "ok",
    })
  );

  app.listen(80, () => console.info("Health check: OK!"));
}
