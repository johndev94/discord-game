import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { WebSocketServer } from 'ws';

dotenv.config({ path: "../.env" });

const app = express();
const port = 3001;
const sessions = new Map();
const wss = new WebSocketServer({ port: 3002 });

// Allow express to parse JSON bodies
app.use(express.json());

const ENUMS = {
  JOIN_SESSION: "join_session",
  START_SESSION: "start_session",
  UPDATE_SESSION: "update_session",
  END_SESSION: "end_session",
  JOIN_GAME: "join_game",
};

class Spectator {
  name;
  client;
}

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log(`Received message: ${message}`);

    switch (data.type) {
      case ENUMS.JOIN_SESSION:
        if (!sessions.has(data.channelId)) {
          console.info("Creating new session");
          sessions.set(data.channelId, {
            clients: [ws],
            spectators: [{ name: data.name, id: data.user?.id ?? "unknown" }],
            players: [],
            board: [],
          });
        } else {
          console.info("Adding spectator to session");

          const session = sessions.get(data.channelId);

          if (!session.clients.includes(ws)) {
            session.clients.push(ws);
          }

          const alreadySpectating = session.spectators.find(
            (s) => s.id === data.user?.id
          );

          if (!alreadySpectating) {
            session.spectators.push({ name: data.name, id: data.user?.id ?? "unknown" });
          }
        }

        // Send updated session data back to all clients in this session
        const updatedSession = sessions.get(data.channelId);
        const payload = JSON.stringify({
          type: ENUMS.JOIN_SESSION,
          spectators: updatedSession.spectators,
        });

        updatedSession.clients.forEach((client) => {
          if (client.readyState === 1) client.send(payload); // 1 === WebSocket.OPEN
        });
        break;

      case ENUMS.UPDATE_SESSION:
        const updateSession = sessions.get(data.channelId);
        if (!updateSession) return;

        const updatePayload = JSON.stringify({
          type: ENUMS.UPDATE_SESSION,
          message: `${data.user?.name ?? "Unknown"}: ${data.message}`,
        });

        updateSession.clients.forEach((client) => {
          if (client.readyState === 1) client.send(updatePayload);
        });
        break;

        case ENUMS.JOIN_GAME: {
          const session = sessions.get(data.channelId);
          if (!session || !data.user?.id) return;
        
          const userId = data.user.id;
          const userName = data.user.name;
        
          // Remove user from spectators list
          session.spectators = session.spectators.filter((s) => s.id !== userId);
        
          // Check if already a player
          const isAlreadyPlayer = session.players.some((p) => p.id === userId);
        
          // If the user is not already a player and there's room for one
          if (!isAlreadyPlayer && session.players.length < 2) {
            const color = session.players.length === 0 ? "red" : "yellow"; // Assign "red" to the first player, "yellow" to the second
            const isTurn = session.players.length === 0; // First player gets the first turn
            const dateJoined = new Date().toISOString(); // Get the current date and time in ISO format
        
            session.players.push({
              id: userId,
              name: userName,
              color,
              isTurn,
              dateJoined,
            });
        
            // Send back the updated session
            const updatePayload = JSON.stringify({
              type: ENUMS.UPDATE_SESSION,
              players: session.players,
              spectators: session.spectators,
              message: `${userName} joined the game as ${color} and is ${isTurn ? "now" : "not"} taking their turn.`,
            });
        
            session.clients.forEach((client) => {
              if (client.readyState === 1) client.send(updatePayload); // Only send to open WebSocket clients
            });
          }
          break;
        }
        
        

      // Add additional case handlers for START_SESSION, END_SESSION, etc. as needed.
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    // Optional: Remove the ws client from any sessions here
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

  // Return the access_token to our client as { access_token: "..." }
  res.send({ access_token });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
