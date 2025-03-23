import { DiscordSDK } from "@discord/embedded-app-sdk";
import rocketLogo from "./assets/rocket.png";

import "./style.css";

function App() {
	// Will eventually store the authenticated user's access_token
	let auth;
	let activityChannelName = "Unknown";

	const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

	setupDiscordSdk().then(() => {
		console.log("Discord SDK is authenticated");
		appendVoiceChannelName();
	});

	async function setupDiscordSdk() {
		await discordSdk.ready();
		console.log("Discord SDK is ready");

		// Authorize with Discord Client
		const { code } = await discordSdk.commands.authorize({
			client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
			response_type: "code",
			state: "",
			prompt: "none",
			scope: ["identify", "guilds", "applications.commands", "rpc.voice.read"],
		});

		// Retrieve an access_token from your activity's server
		const response = await fetch("/.proxy/api/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				code,
			}),
		});

		const { access_token } = await response.json();

		// Authenticate with Discord client (using the access_token)
		auth = await discordSdk.commands.authenticate({
			access_token,
		});

		if (auth == null) {
			throw new Error("Authenticate command failed");
		}

		const appElement = document.querySelector<HTMLElement>("#app");

		// Check if the element exists before setting its innerHTML
		if (appElement) {
			appElement.innerHTML = `
        <div>
          <img src="${rocketLogo}" class="logo" alt="Discord" />
          <h1>Welcome!</h1>
          <p>Server: ${activityChannelName}</p>
        </div>
      `;
		} else {
			console.error('Element with ID "app" not found.');
		}
	}

	async function appendVoiceChannelName() {
		console.log("Checking Discord SDK connection...");
		console.log("Channel ID:", discordSdk.channelId);
		console.log("Guild ID:", discordSdk.guildId);
		// We abolish, loggers only

		if (discordSdk.channelId && discordSdk.guildId) {
			try {
				console.log("Fetching channel details...");
				const channel = await discordSdk.commands.getChannel({
					channel_id: discordSdk.channelId,
				});
				console.log("Fetched channel:", channel);

				if (channel?.name) {
					activityChannelName = channel.name;
				}
			} catch (error) {
				console.error("Error fetching channel:", error);
			}
		} else {
			console.warn("Not in a voice channel.");
		}

		console.log("Final activityChannelName:", activityChannelName);

		const appElement = document.querySelector<HTMLElement>("#app");

		// Check if the element exists before setting its innerHTML
		if (appElement) {
			appElement.innerHTML = `
        <div>
          <img src="${rocketLogo}" class="logo" alt="Discord" />
          <h1>Welcome!</h1>
          <p>Server: ${activityChannelName}</p>
        </div>
      `;
		} else {
			console.error('Element with ID "app" not found.');
		}
	}

	return (
		<>
			{/* TODO: We should be doing the rendering inside here instead of doing it in index.html with the innerHTML */}
			{/* Only did this for ensuring the app still works. */}
		</>
	);
}

export default App;
