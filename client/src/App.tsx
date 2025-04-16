import { useState, useEffect } from "react";
import { discordSdk } from "./DiscordSDKHack";
import rocketLogo from "./assets/rocket.png";
import "./style.css";


interface User {
  id?: string;
  name?: string;
}

interface Player extends User {
  color: "red" | "yellow";
  isTurn: boolean;
  score: number;
  //for deciding who goes first
  joinedAt: Date;
  //think we should also have discord images here so the players can use their image as a chip
}

const ENUMS = {
  JOIN_SESSION: "join_session",
  START_SESSION: "start_session",
  UPDATE_SESSION: "update_session",
  END_SESSION: "end_session",
  JOIN_GAME: "join_game",
};

function App() {
  // Will eventually store the authenticated user's access_token
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const [currentUser, setCurrentUser] = useState<User>(); // The current user
  const [spectators, setSpectators] = useState<User[]>([]); // Ensure spectators is always an array
  const [players, setPlayers] = useState<Player[]>([]); // The users in the current session

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

      if (
        data.type === ENUMS.JOIN_SESSION ||
        data.type === ENUMS.UPDATE_SESSION
      ) {
        setSpectators(data.spectators);
        setPlayers(data.players ?? []);
        if (data.message) {
          setMessages((prevMessages) => [...prevMessages, data.message]);
        }
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
      // May need to remove the user from the session here
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
  const handleJoinGame = () => {
    if (socket && currentUser && channel) {
      socket.send(
        JSON.stringify({
          type: ENUMS.JOIN_GAME,
          user: currentUser,
          channelId: channel.id,
        })
      );
    }
  };

  return (
    <div id="app">
      <header className="header">
        <img src={rocketLogo} className="logo" alt="Discord" />
        <h1>Welcome to Connect 4</h1>
        <h2>Current User: {currentUser?.name}</h2>
        <p>Channel Name: {channel ? channel.name : "No channel"}</p>
      </header>

      <main className="main-content">
        <button className="join-btn" onClick={handleJoinGame}>
          Join Game!
        </button>

        <section className="lists">
          <div className="section">
            <h2>Spectators</h2>
            <ul>
              {spectators?.map((spectator) => (
                <li key={spectator.id}>{spectator.name}</li>
              ))}
            </ul>
          </div>

          <div className="section">
            <h2>Players</h2>
            <ul>
              {players?.map((player) => (
                <li key={player.id}>
                  {player.name} — <strong>{player.color.toUpperCase()}</strong>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="chat">
          <h2>WebSocket Chat</h2>
          <div className="chat-box">
            {messages.map((msg, index) => (
              <div key={index} className="chat-message">
                {msg}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
