import { useState } from "react";
import { DiscordSDK } from "@discord/embedded-app-sdk";
import rocketLogo from "./assets/rocket.png";
import "./style.css";

function App() {
	// Will eventually store the authenticated user's access_token
	const [activityChannelName, setActivityChannelName] = useState("Unknown");
	const [user, setUser] = useState<string>("Default User");
	const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

	async function initializeDiscordSdk() {
		await discordSdk.ready();
		console.log("Discord SDK is ready");
	}

	async function authenticateUser() {
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

		console.log("User authenticated:", auth.user);
		return auth.user; // Return user data instead of storing globally
	}

	async function appendVoiceChannelName() {
		if(!discordSdk.channelId || !discordSdk.guildId) {
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
		await initializeDiscordSdk();
		let newUser = await authenticateUser();
		setUser(newUser.global_name ?? "Default User");
		await appendVoiceChannelName();
	}

	return (
		<>
			<div id="app">
				<img src={rocketLogo} className="logo" alt="Discord" />
				<h1>Welcome {user}!</h1>
				<button onClick={login}>Login</button>
				<p>Server: {activityChannelName}</p>
			</div>
		</>
	);
}

export default App;
