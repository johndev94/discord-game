import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { WebSocketServer, WebSocket } from 'ws';
import Message from "@common/dto/message.dto"
import MESSAGE_TYPE from "@common/enum/message-types.enum";
import GameSessionEntity from "./entity/game-session.entity";
import PlayerDTO from "@common/dto/player.dto";
import SessionDTO from "@common/dto/session.dto";
import BoardDTO from "@common/dto/board.dto";
import JoinSessionDTO from "@common/dto/join-session.dto"
import SpectatorDTO from "@common/dto/spectator.dto";

dotenv.config({ path: "../.env" });

const app = express();
const port = 3001;
const sessions = new Map<string, GameSessionEntity>();

const wss : WebSocketServer = new WebSocketServer({ port: 3002 })

app.use(express.json());

wss.on('connection', (ws : WebSocket) => {
  console.log('Client connected');

  ws.on('message', (message : any) => {
    const data : Message<any> = JSON.parse(message);
    console.log(`Received message: ${message}`);

    // processMessage(data, ws, sessions);
    
    // TODO: Move into service class
    switch (data.messageType) {
      case MESSAGE_TYPE.JOIN_SESSION: 
        joinSession(data, ws, sessions);
        break;
      
      case MESSAGE_TYPE.START_SESSION: 
        startSession(data, ws);
        break;
      
      case MESSAGE_TYPE.UPDATE_SESSION: 
        updateSession(data, ws);
        break;
      
      case MESSAGE_TYPE.END_SESSION: 
        endSession(data, ws);
        break;
      
      default: 
        console.info("Unknown message type");
        break;
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

});

function joinSession(joinMessage: Message<JoinSessionDTO>, ws: WebSocket, sessions: Map<string, GameSessionEntity>) {
  let session = sessions.get(joinMessage.channelId!);

  if (!session) {
    const sessionDTO = new SessionDTO([], [joinMessage.data?.spectator!], new BoardDTO());
    session = new GameSessionEntity([ws], sessionDTO);
    sessions.set(joinMessage.channelId!, session);
  } else {
    // TODO: Don't add the client if the user is in the session. Also use playerID over username 
    // Add WebSocket to session if not already included
    if (!session.clients.includes(ws)) {
      session.clients.push(ws);
    }

    // Add player to session if not already present
    if (!session.sessionData.players.find((p: SpectatorDTO) => p.username === joinMessage.data?.spectator.username)) {
      session.sessionData.players.push(new SpectatorDTO(joinMessage.data?.spectator?.username ?? undefined));
    }
  }

  // Send updated session data to all connected clients
  let joinSessionMessge = new Message<SessionDTO>(joinMessage.messageType, joinMessage.channelId, session.sessionData);

  session.clients.forEach((client: WebSocket) => {
    client.send(JSON.stringify(joinSessionMessge));
  });
}

// TODO
function startSession(startSessionDTO : any, ws : WebSocket) {
  console.info("Starting session");
}

// TODO
function updateSession(updateSessionDTO: Message<UpdateDTO>, ws : WebSocket) {
  console.info("INFO: Updating session", updateSessionDTO);
  
  let gameSession = sessions.get(updateSessionDTO.channelId);

  gameSession.clients.forEach((client : WebSocket) => {
    console.log(`Sending message to client`);
    client.send(JSON.stringify(updateSessionDTO)); // This will be game session data later.
  });
}

// TODO
function endSession(endSessionDTO: any, ws : WebSocket) {
  console.info("Ending session", endSessionDTO);
}

app.post("/api/token", async (req, res) => {
  // Exchange the code for an access_token
  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },

    body: new URLSearchParams({
      client_id: process.env.VITE_DISCORD_CLIENT_ID || '',
      client_secret: process.env.DISCORD_CLIENT_SECRET || '',
      grant_type: "authorization_code",
      code: req.body.code || '',
    }),

  });

  // Retrieve the access_token from the response
  const { access_token } = (await response.json()) as { access_token: string };

  // Return the access_token to our client as { access_token: "..."}
  res.send({access_token});
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
