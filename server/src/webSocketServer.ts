import { WebSocketServer } from "ws";
import { WebSocket } from "./types/websocket";
import Message from "@common/dto/message.dto";
import MESSAGE_TYPE from "@common/enum/message-types.enum";
import GameSessionEntity from "./entity/game-session.entity";
import SessionDTO from "@common/dto/session.dto";
import BoardDTO from "@common/dto/board.dto";
import JoinSessionDTO from "@common/dto/join-session.dto";
import SpectatorDTO from "@common/dto/spectator.dto";

const sessions = new Map<string, GameSessionEntity>();
const wss: WebSocketServer = new WebSocketServer({ port: 3002 });


function handleMessage(data: Message<any>, ws: WebSocket) {
	switch (data.messageType) {
		case MESSAGE_TYPE.JOIN_SESSION:
			joinSession(data, ws);
			break;
		case MESSAGE_TYPE.START_SESSION:
			startSession(data, ws);
			break;
		case MESSAGE_TYPE.UPDATE_SESSION:
			updateSession(data);
			break;
		case MESSAGE_TYPE.END_SESSION:
			endSession(data, ws);
			break;
		default:
			console.info("Unknown message type");
			break;
	}
}

function joinSession(joinMessage: Message<JoinSessionDTO>, ws: WebSocket) {
	let session = sessions.get(joinMessage.channelId!);

	if (!session) {
		const sessionDTO = new SessionDTO(
			[],
			[joinMessage.data?.spectator!],
			new BoardDTO()
		);
		session = new GameSessionEntity([ws], sessionDTO);
		sessions.set(joinMessage.channelId!, session);
	} else {
		if (!session.clients.includes(ws)) {
			session.clients.push(ws);
		}

		// Check if the user is already in the spectators list by their `playerId` or `username`
		const newSpectator = joinMessage.data?.spectator;
		if (newSpectator && !session.sessionData.spectators.some(spectator => spectator.playerId === newSpectator.playerId)) {
			session.sessionData.spectators.push(newSpectator);
		}
	}

	const joinSessionMessage = new Message<SessionDTO>(
		joinMessage.messageType,
		joinMessage.channelId,
		session.sessionData
	);

	session.clients.forEach((client: WebSocket) => {
		// if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify(joinSessionMessage));
		// }
	});
}

function startSession(startSessionDTO: any, ws: WebSocket) {
	console.info("Starting session");
}

function updateSession(updateSessionDTO: Message<SessionDTO>) {
	console.info("INFO: Updating session", updateSessionDTO);

	const gameSession = sessions.get(updateSessionDTO?.channelId!);

	// I want to do game validation here such as updating peices placed, winners, lossers
	// points, players, spectators, and maybe people in the queue.

	// let updateSessionDTO = processSession(updateSessionDTO);

	if (gameSession) {
		gameSession.clients.forEach((client: WebSocket) => {
			// if(client.readyState === WebSocket.OPEN){
				client.send(JSON.stringify(updateSessionDTO));
			// }
		});
	}
}

function endSession(endSessionDTO: any, ws: WebSocket) {
	console.info("Ending session", endSessionDTO);
}


function setupHeartbeat(ws: WebSocket) {
	ws.isAlive = true;

	ws.on("pong", function () {
		console.log("GOT A PONG");
		ws.isAlive = true;
	});
}

function startHeartbeat(wss: WebSocketServer, intervalTime: number = 30000) {
	const interval = setInterval(() => {

		wss.clients.forEach((ws: WebSocket) => {
			if (!ws.isAlive) {
				console.log("WE KILLING THIS THING");
				return ws.terminate();
			}

			ws.isAlive = false;
			ws.ping(() => {
				console.log("WE PINGING");
			});
		});

	}, intervalTime);

	wss.on('close', () => {
		console.log("HE DIED");
		clearInterval(interval);
	});
}

function onClientConnection(ws: WebSocket) {
	console.log("New client connected");

	setupHeartbeat(ws);

	ws.on("message", (message: string) => {
		const data: Message<any> = JSON.parse(message);
		console.log(`Received message: ${message}`);
		handleMessage(data, ws);
	});

	ws.on("close", () => {
		console.log("Client disconnected");
		// May need to check if the user is diconnecting or not and try to reconnect
	});
}


wss.on("connection", onClientConnection);
startHeartbeat(wss);

export default wss;
