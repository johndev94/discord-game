import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { WebSocketServer } from 'ws';

dotenv.config({ path: "../.env" });

const app = express();
const port = 3001;
const sessions = new Map();
const wss = new WebSocketServer({ port: 3002 })

// Allow express to parse JSON bodies
app.use(express.json());

const ENUMS = {
  JOIN_SESSION: "join_session",
  START_SESSION: "start_session",
  UPDATE_SESSION: "update_session",
  END_SESSION: "end_session",
};

class Player{
  name;
  client;
}


wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    // if message is join_session, we need to add the player to the session.
    // if message is start_session, we need to create a new session.
    // if message is update_session, we need to send the message to all clients in the session.

    // NOTE: All case bodies will have their own functions later, this is just a placeholder.
    // FYI: The fronted will ignore any messages sent here that don't have a type of ENUMS.JOIN_SESSION or ENUMS.UPDATE_SESSION. etc..
    switch (data.type) {
      case ENUMS.JOIN_SESSION:
        if (!sessions.has(data.id)) {
          console.info("Creating new session");
          sessions.set(
              data.id, {
              clients: [ws],
              players: [{name: data.name}],
              board: []
            }
          );
        } else if (sessions.has(data.id) && !sessions.get(data.id).clients.includes(ws)) {
          console.info("Adding player to session");
          let session = sessions.get(data.id);
          session = sessions.get(data.id);
          session.players.push({name: data.name});
          session.clients.push(ws);
          sessions.set(data.id, session);
        }

        let joiningSession  = sessions.get(data.id);

        joiningSession.clients.forEach(client => {
          console.log(`Sending message to client ${client}`);
          client.send(JSON.stringify({type: ENUMS.JOIN_SESSION, players: joiningSession.players}));
        });

        break;
      case ENUMS.START_SESSION:
        console.info("Starting session");
        break;

      case ENUMS.UPDATE_SESSION:
        console.info("Updating session");
        let updatingSession = sessions.get(data.id);
    
        updatingSession.clients.forEach(client => {
          console.log(`Sending message to client`);
          client.send(JSON.stringify({type: ENUMS.UPDATE_SESSION, message: data.message})); // This will be game session data later.
        });
        break;

      case ENUMS.END_SESSION:
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


app.post("/api/token", async (req, res) => {
  // Exchange the code for an access_token
  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.VITE_DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: req.body.code,
    }),
  });

  // Retrieve the access_token from the response
  const { access_token } = await response.json();

  // Return the access_token to our client as { access_token: "..."}
  res.send({access_token});
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
