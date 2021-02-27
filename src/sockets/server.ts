import WebSocket from "isomorphic-ws";

const wss: WebSocket.Server = new WebSocket.Server(
  {
    port: 13337,
    perMessageDeflate: {
      zlibDeflateOptions: {
        // See zlib defaults.
        chunkSize: 1024,
        memLevel: 7,
        level: 3,
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024,
      },
      // Other options settable:
      clientNoContextTakeover: true, // Defaults to negotiated value.
      serverNoContextTakeover: true, // Defaults to negotiated value.
      serverMaxWindowBits: 10, // Defaults to negotiated value.
      // Below options specified as default values.
      concurrencyLimit: 10, // Limits zlib concurrency for perf.
      threshold: 1024, // Size (in bytes) below which messages
      // should not be compressed.
    },
  },
  () => console.log("Listening...")
);

const connections: WebSocket[] = [];

wss.on("connection", (client) => {
  connections.push(client);

  client.send(JSON.stringify({ bar: "foo" }));
});
