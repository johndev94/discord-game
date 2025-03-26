import { useState } from "react";
import { DiscordSDK } from "@discord/embedded-app-sdk";
import rocketLogo from "./assets/rocket.png";
import "./style.css";
import { Player } from "./types/player";

export function App() {
  // Will eventually store the authenticated user's access_token
  const [activityChannelName, setActivityChannelName] = useState("Unknown");
  const [user, setUser] = useState<string>("Default User");
  const [players, setPlayers] = useState<Player[]>([]); // Fix: Ensure it's just an array of Player objects
  const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
  const [counter, setCounter] = useState<number>(0);

  async function addPlayer(authUser: any) {
    const newPlayer: Player = {
      id: authUser.id,
      name: authUser.global_name || "Unknown Player",
      avatar: authUser.avatar
        ? `https://cdn.discordapp.com/avatars/${authUser.id}/${authUser.avatar}.png`
        : undefined,
      color: players.length === 0 ? "red" : "yellow", // First player is red, second is yellow
      isTurn: players.length === 0, // First player starts, can make this random after testing
      score: 0,
    };

    setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
  }

  async function initializeDiscordSdk() {
    await discordSdk.ready();
    console.log("Discord SDK is ready");
  }

  async function authenticateUser() {
    if (players.length >= 2) {
      console.log("Game is full");
      return;
    }

    // Each user must go through authorization
    const { code } = await discordSdk.commands.authorize({
      client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
      response_type: "code",
      state: "",
      prompt: "none",
      scope: ["identify", "guilds", "applications.commands", "rpc.voice.read"],
    });

    // Fetch the access token for the user
    const response = await fetch("/.proxy/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    const { access_token } = await response.json();

    // Authenticate the user with Discord client
    const auth = await discordSdk.commands.authenticate({ access_token });

    if (!auth) {
      throw new Error("Authenticate command failed");
    }

    console.log("User authenticated:", auth.user.global_name);

    // Add the authenticated player
    addPlayer(auth.user);
  }

  async function appendVoiceChannelName() {
    if (!discordSdk.channelId || !discordSdk.guildId) {
      console.warn("Not in a voice channel");
      return;
    }

    try {
      const channel = await discordSdk.commands.getChannel({
        channel_id: discordSdk.channelId,
      });
      if (channel?.name) {
        setActivityChannelName(channel.name);
      }
    } catch (error) {
      console.error("Error fetching channel:", error);
    }
  }

  async function login() {
    // This will display the name of the current user on the activity
    // We will need to implement a backend server to share all the users
    // information with the frontend
    console.log("Logging in...");
    await initializeDiscordSdk();
    await authenticateUser();
    await appendVoiceChannelName();
  }

  // Increment counter
  const incrementCounter = () => setCounter((prevCount) => prevCount + 1);

  // Decrement counter
  const decrementCounter = () => setCounter((prevCount) => prevCount - 1);

  return (
    <div id="app">
      <img src={rocketLogo} className="logo" alt="Discord" />
      <h1>Welcome to Connect 4</h1>
      {players.length < 2 ? (
        <button onClick={authenticateUser}>Login</button>
      ) : (
        <p>Game is full!</p>
      )}
      <p>Server: {activityChannelName}</p>
      <h2>Players:</h2>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            <strong>Name:</strong> {player.name} <br />
            <strong>Color:</strong> {player.color} <br />
            <strong>Turn:</strong> {player.isTurn ? "Yes" : "No"} <br />
            <strong>Score:</strong> {player.score} <br />
            {player.avatar && (
              <img
                src={player.avatar}
                alt={`${player.name}'s avatar`}
                width="50"
                height="50"
              />
            )}
          </li>
        ))}
      </ul>

      {/* Counter Buttons */}
      <div className="counter">
        <h3>Counter: {counter}</h3>
        <button onClick={decrementCounter}>Decrement</button>
        <button onClick={incrementCounter}>Increment</button>
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
