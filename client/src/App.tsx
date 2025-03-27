import { useState, useEffect } from "react";
// import { DiscordSDK } from "@discord/embedded-app-sdk";
import { discordSdk } from "./DiscordSDKHack";
import rocketLogo from "./assets/rocket.png";
import "./style.css";

function App() {
	// Will eventually store the authenticated user's access_token
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [messages, setMessages] = useState<string[]>([]);
	const [input, setInput] = useState("");

	const [activityChannelName, setActivityChannelName] = useState("Unknown");
	const [user, setUser] = useState<string>("Default User");
	const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
	// const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

	// const protocol = `wss`;
	// const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
	// const proxyDomain = 'discordsays.com';
	// const url = new URL(`${protocol}://${clientId}.${proxyDomain}/.proxy`);


	useEffect(() => {
	
		// const wsProtocol = location.protocol === 'http:' ? 'ws' : 'wss'

		// console.log(`${wsProtocol}://${location.host}`);
		const ws = new WebSocket(`/.proxy/ws`);
		console.log(ws)

		ws.onopen = () => {
			console.log("Connected to WebSocket server");
		};

		ws.onmessage = (event) => {
			console.log("Message received:", event.data);
			setMessages((prevMessages) => [...prevMessages, event.data]);
		};

		ws.onclose = () => {
			console.log("Disconnected from WebSocket server");
		};

		ws.onerror = (error) => {
			console.error("WebSocket error:", error);
		};

		setSocket(ws);

		// Cleanup function
		// return () => {
		// 	ws.close();
		// };
	}, []);

	// async function authenticateUser() {
	// 	// Each user must go through authorization
	// 	console.log("Authenticating user...");
	// 	await discordSdk.ready();
		
	// 	const { code } = await discordSdk.commands.authorize({
	// 		client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
	// 		response_type: "code",
	// 		state: "",
	// 		prompt: "none",
	// 		scope: ["identify", "guilds", "applications.commands", "rpc.voice.read"],
	// 	});

	// 	// Fetch the access token for the user
	// 	const response = await fetch("/.proxy/api/token", {
	// 		method: "POST",
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 		},
	// 		body: JSON.stringify({ code }),
	// 	});

	// 	console.log(response);

	// 	const { access_token } = await response.json();

	// 	// Authenticate the user with Discord client
	// 	const auth = await discordSdk.commands.authenticate({ access_token });

	// 	if (!auth) {
	// 		throw new Error("Authenticate command failed");
	// 	}

		// const newPlayer = {
		// 	id: auth.user.id,
		// 	name: auth.user.global_name ?? "Default User",
		// };

	// 	setPlayers([...players, newPlayer]);
	// 	console.log("User authenticated:", auth.user.global_name);
	// }

	async function appendVoiceChannelName() {

		if (!discordSdk.channelId) {
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
		// This will display the name the current user on the activity
		// We will need to implement a backend server to share all the users
		// information with the frontend
		console.log("Logging in...");
		const auth = await discordSdk.initialize();
		setPlayers([...players, {id: auth.user.id, name: auth.user.global_name ?? "Default User"}]);
		await appendVoiceChannelName();
	}

	const sendMessage = () => {
		if (socket && input) {
			socket.send(input);
			setInput("");
		}
	};

	return (
		<div id="app">
			<img src={rocketLogo} className="logo" alt="Discord" />
			<h1>Welcome to Connect 4</h1>
			{players.length < 2 ? (
				<button onClick={login}>Login</button>
			) : (
				<p>Game is full!</p>
			)}
			<p>Server: {activityChannelName}</p>
			<h2>Players:</h2>
			<ul>
				{players.map((player) => (
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
