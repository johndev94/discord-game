
import { WebSocketServer, WebSocket } from "ws";
import Message from "@common/dto/message.dto";
import { handleMessage } from "./process-message-service";

function startHeartbeat(wss: WebSocketServer, intervalTime: number = 30000) {
    const interval = setInterval(() => {
        wss.clients.forEach((ws: WebSocket) => {
            if (!ws.isAlive) {
                console.log("WE KILLING THIS THING");
                return ws.terminate();
            }

            ws.isAlive = false;
            ws.ping(() => {
                // We can use this another time
            });
        });
    }, intervalTime);

    return interval;
}

function onClientConnection(ws: WebSocket) {
    console.log("New client connected");
    ws.isAlive = true;

    ws.on("message", (message: string) => {
        const data: Message<any> = JSON.parse(message);
        console.log(`Received message: ${message}`);
        handleMessage(data, ws);
    });

    ws.on("close", () => {
        console.log("Client disconnected");
        // May need to check if the user is diconnecting or not and try to reconnect
    });

    ws.on("pong", function () {
        ws.isAlive = true;
    });
}

export function initialiseWebSocket(wss: WebSocketServer) {
    wss.on("connection", onClientConnection);

    const interval = startHeartbeat(wss);

    wss.on('close', () => {
        console.log("THE SERVER DEAD");
        clearInterval(interval);
    });
}