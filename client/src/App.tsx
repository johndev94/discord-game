import { DiscordSDK } from "@discord/embedded-app-sdk";
import rocketLogo from "./assets/rocket.png";
import "./style.css";
import { Player } from "./types/player";
// SyncContextProvider instead of old verison of SyncProvider
import { SyncContextProvider, useSyncState } from "@robojs/sync";

export function Game() {
  const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

  // Apparent correct `useSyncState` usage
  const [players, setPlayers] = useSyncState<Player[]>([], ["players"]);

  async function addPlayer(authUser: any) {
    if (players.length >= 2) return;

    const newPlayer: Player = {
      id: authUser.id,
      name: authUser.global_name || "Unknown Player",
      avatar: authUser.avatar
        ? `https://cdn.discordapp.com/avatars/${authUser.id}/${authUser.avatar}.png`
        : undefined,
      color: players.length === 0 ? "red" : "yellow",
      isTurn: players.length === 0,
      score: 0,
    };

    setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers, newPlayer];
      console.log("Updated players:", updatedPlayers); //check if state updates
      return updatedPlayers;
      setPlayers(updatedPlayers);
    });
  }

  async function authenticateUser() {
    if (players.length >= 2) return;

    const { code } = await discordSdk.commands.authorize({
      client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
      response_type: "code",
      state: "",
      prompt: "none",
      scope: ["identify", "guilds", "applications.commands", "rpc.voice.read"],
    });

    console.log("Authorization code:", code); 

    const response = await fetch("/.proxy/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const { access_token } = await response.json();
    console.log("Access Token:", access_token); 

    const auth = await discordSdk.commands.authenticate({ access_token });

    console.log("Authenticated user:", auth?.user); 

    if (auth?.user) {
      addPlayer(auth.user);
    } else {
      console.error("Authentication failed");
    }
    setPlayers(players);
  }

  return (
    <div id="app">
      <img src={rocketLogo} className="logo" alt="Discord" />
      <h1>Welcome to Connect 4</h1>
      <button
        onClick={() => {
          console.log("Login button clicked!");
          authenticateUser();
        }}
      >
        Console check
      </button>
      {players.length < 2 ? (
        <button onClick={authenticateUser}>Login</button>
      ) : (
        <p>Game is full!</p>
      )}
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
    </div>
  );
}

// Our code needs to be wrapped in SyncContextProvider for data to be passed to all users
export function App() {
  return (
    <SyncContextProvider>
      <Game />
    </SyncContextProvider>
  );
}

export default App;
