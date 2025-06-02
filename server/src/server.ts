import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { WebSocketServer, WebSocket } from 'ws';
import JoinDTO from "@common/dto/join.dto";
import { MESSAGE_TYPE } from "@common/enum/message-types.enum";

dotenv.config({ path: "../.env" });

const app = express();
const port = 3001;
const sessions = new Map(); // Map<string, SessionDTO>(); Session data?

// SessionData = {
//  clients: WebSocket[]; // Array of WebSocket clients
//  players: PlayerEntity[]; // Array of players in the session
//  spectators: SpectatorEntity[]; // Array of spectators in the session
//  board: BoardEntity; // Game board data
// }

const wss : WebSocketServer = new WebSocketServer({ port: 3002 })

app.use(express.json());

wss.on('connection', (ws : WebSocket) => {
  console.log('Client connected');

  ws.on('message', (message : any) => {
    const data = JSON.parse(message);
    console.log(`Message type: ${data.type}`);
    console.log(`Received message: ${message}`);

    switch (data.type) {
      case MESSAGE_TYPE.JOIN_SESSION: 
        joinSession(data, ws);
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


// When the message type is join_session, we need to add the player to the session.
function joinSession(joinDTO : JoinDTO, ws : WebSocket) {
  console.info("Joining session... Channel ID: " + joinDTO.channelId + " Username: " + joinDTO.username);

  if (!sessions.has(joinDTO.channelId)) {
    console.info("INFO: Creating new session");

    sessions.set(joinDTO.channelId, {
      clients: [ws],
      players: [{ username: joinDTO.username }], // We will make a PlayerEntity later 
      board: [] // We will make a BoardDTO later or a gamestate object.
    });

    console.log("INFO: Current Session after creating: ");
    console.log(sessions.get(joinDTO.channelId));

  } else {
    console.info("INFO: Adding player to session");
    let session = sessions.get(joinDTO.channelId);
  
    if (!session.clients.includes(ws)) {
      session.clients.push(ws);
    }

    if (!session.players.find((p : any) => p.username === joinDTO.username)) {
      session.players.push({ name: joinDTO.username }); // Push a new player object to the players later. 
    }
  }
  
  let joiningSession = sessions.get(joinDTO.channelId);

  joiningSession.clients.forEach((client : WebSocket) => {
    // May want to standertise this message object later as a DTO or WS message object.
    client.send(JSON.stringify({type: MESSAGE_TYPE.JOIN_SESSION, players: joiningSession.players}));
  });
}

function startSession(startSessionDTO : any, ws : WebSocket) {
  console.info("Starting session");
}

function updateSession(updateSessionDTO: any, ws : WebSocket) {
  console.info("INFO: Updating session", updateSessionDTO);
  let updatingSession = sessions.get(updateSessionDTO.sessionId);
  
  updatingSession.clients.forEach((client : WebSocket) => {
    console.log(`Sending message to client`);
    client.send(JSON.stringify({type: MESSAGE_TYPE.UPDATE_SESSION, message: updateSessionDTO.message})); // This will be game session data later.
  });
}

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
