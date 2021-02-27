let ws: null | WebSocket = null;

export default class SocketClient {
  public static ping() {
    ws = new WebSocket("ws://localhost:13337/");

    ws.onopen = () => console.log("I connected!");
    ws.onmessage = ({ data }) => console.log("Data was ", JSON.parse(data));
  }
}
