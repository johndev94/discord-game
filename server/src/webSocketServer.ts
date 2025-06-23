import { WebSocketServer } from "ws";
import { initialiseWebSocket } from "./services/websocket-server-service"

const wss: WebSocketServer = new WebSocketServer({ port: 3002 });
initialiseWebSocket(wss);

export default wss;