import { useState, useEffect } from "react";
import { discordSdk } from "./DiscordSDKHack";
import rocketLogo from "./assets/rocket.png";

interface User {
  id?: string;
  name?: string;
}

const ENUMS = {
  JOIN_SESSION: "join_session",
  START_SESSION: "start_session",
  UPDATE_SESSION: "update_session",
  END_SESSION: "end_session",
};

function App() {
  // Will eventually store the authenticated user's access_token
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const [currentUser, setCurrentUser] = useState<User>(); // The current user
  const [players, setPlayers] = useState<User[]>([]); // Ensure players is always an array
  const [channel, setChannel] = useState<any | null>(null); // The channel ID of the current user

  useEffect(() => {
    const ws = new WebSocket(`/.proxy/ws`);

    ws.onopen = async () => {
      console.log("Connected to WebSocket server");

      if (!currentUser) {
        const auth = await discordSdk.initialize();
        setCurrentUser({
          id: auth?.user.id,
          name: auth?.user.global_name ?? undefined,
        });
      }

      const channel = await getCurrentVoiceChannel();

      if (channel !== null) {
        setChannel(channel);
        console.log("Channel ID:", channel?.id);
      }

      ws.send(
        JSON.stringify({
          type: ENUMS.JOIN_SESSION,
          channelId: channel?.id,
          name: currentUser?.name,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Data received:", data);
      if (data.type === ENUMS.JOIN_SESSION) {
        setPlayers(data.players);
      } else if (data.type === ENUMS.UPDATE_SESSION) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
      // May need to remove the user from the sesssion here
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(ws);

    // Cleanup function
    return () => {
      ws.close();
    };
  }, [currentUser]);

  async function getCurrentVoiceChannel() {
    if (!discordSdk.channelId) {
      console.warn("Not in a voice channel");
      return;
    }

    try {
      const channel = await discordSdk.commands.getChannel({
        channel_id: discordSdk.channelId,
      });
      return channel;
    } catch (error) {
      console.error("Error fetching channel:", error);
    }
  }

  const sendMessage = () => {
    if (socket && input) {
      socket.send(
        JSON.stringify({
          type: ENUMS.UPDATE_SESSION,
          user: currentUser,
          message: input,
        })
      );
      setInput("");
    }
  };

  return (
    <div id="app">
      <img src={rocketLogo} className="logo" alt="Discord" />
      <h1>Welcome to Connect 4</h1>

      {/* May need to do this va;lidation later or redner something different based on player count */}
      <button>Join Game!</button>

      <h1>Current User: {currentUser?.name}</h1>
      <p>Channel Name: {channel ? channel.name : "No channel"}</p>

      <h2>Players:</h2>
      <ul>
        {/* Need to return the player count from the server */}
        {players?.map((player) => (
          <li key={player.id}>{player.name}</li>
        ))}
      </ul>

      <div>
        <h1>WebSocket Chat</h1>
        <div>
          {messages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
// async function addPlayer(authUser: any) {
//     const newPlayer: Player = {
//       id: authUser.id,
//       name: authUser.global_name || "Unknown Player",
//       avatar: authUser.avatar
//         ? `https://cdn.discordapp.com/avatars/${authUser.id}/${authUser.avatar}.png`
//         : undefined,
//       color: players.length === 0 ? "red" : "yellow", // First player is red, second is yellow
//       isTurn: players.length === 0, // First player starts, can make this random after testing
//       score: 0,
//     };
