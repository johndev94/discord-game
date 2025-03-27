import { DiscordSDK } from "@discord/embedded-app-sdk";
import { log } from "winston";

const SESSION_STORAGE_KEY = "__DISCORD_SDK_HACK__";

interface DiscordSDKAuthResponse {
	access_token: string;
	user: {
		username: string;
		discriminator: string;
		id: string;
		public_flags: number;
		avatar?: string | null | undefined;
		global_name?: string | null | undefined;
	};
	scopes: (
		| -1
		| "identify"
		| "email"
		| "connections"
		| "guilds"
		| "guilds.join"
		| "guilds.members.read"
        | "guilds.channels.read"
		| "gdm.join"
		| "bot"
		| "rpc"
		| "rpc.notifications.read"
		| "rpc.voice.read"
		| "rpc.voice.write"
		| "rpc.video.read"
		| "rpc.video.write"
		| "rpc.screenshare.read"
		| "rpc.screenshare.write"
		| "rpc.activities.write"
		| "webhook.incoming"
		| "messages.read"
		| "applications.builds.upload"
		| "applications.builds.read"
		| "applications.commands"
		| "applications.commands.permissions.update"
		| "applications.store.update"
		| "applications.entitlements"
		| "activities.read"
		| "activities.write"
		| "relationships.read"
		| "relationships.write"
		| "voice"
		| "dm_channels.read"
		| "role_connections.write"
		| "presences.read"
		| "presences.write"
		| "openid"
		| "dm_channels.messaages.read"
        | "dm_channels.messages.write"
        | "gateway.connect"
        | "account.global_name.update"
        | "payment_sources.country_code"
        | "sdk.social_layer_presence"
        | "sdk.social_layer"
        | "lobbies.write"
	)[];
	expires: string;
	application: {
		id: string;
		description: string;
		name: string;
		icon?: string | null | undefined;
		rpc_origins?: string[] | undefined;
	};
}

interface DiscordSDKHackData {
	isInitialized: boolean;
	cachedAuthData: DiscordSDKAuthResponse;
}

function getHackData(): DiscordSDKHackData | undefined {
	const data = sessionStorage.getItem(SESSION_STORAGE_KEY);
	if (data) {
		return JSON.parse(data);
	}
	return undefined;
}

function setHackData(data: DiscordSDKHackData) {
	sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
}

class DiscordSDKManager {
	discordSdk: DiscordSDK;
	auth: DiscordSDKAuthResponse | undefined = undefined;

	constructor() {
		this.discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
	}

	get clientId() {
		return this.discordSdk.clientId;
	}

	get instanceId() {
		return this.discordSdk.instanceId;
	}

	get platform() {
		return this.discordSdk.platform;
	}

	get guildId() {
		return this.discordSdk.guildId;
	}

	get channelId() {
		return this.discordSdk.channelId;
	}

	get configuration() {
		return this.discordSdk.configuration;
	}

	get commands() {
		return this.discordSdk.commands;
	}

	async ready() {
		// Hack for https://github.com/discord/embedded-app-sdk/issues/41 (only affects development environment)
		if (import.meta.env.DEV) {
            console.log("Using dev auth hack ");
			const data = getHackData();
			if (data) {
				const discordSdkAny = this.discordSdk as any;
				if (discordSdkAny.sourceOrigin.includes("discord.com")) {
					sessionStorage.removeItem(SESSION_STORAGE_KEY);
				} else {
					discordSdkAny.sourceOrigin = "*";
					discordSdkAny.isReady = true;

					this.auth = data.cachedAuthData;
				}
			}
		}

		await this.discordSdk.ready();
	}

	async initialize() {
		console.log("Loading Discord SDK...");
		await this.ready();
		if (this.auth) return;

		console.log("Discord SDK loaded!");
		const { code } = await this.discordSdk.commands.authorize({
			client_id: this.discordSdk.clientId,
			response_type: "code",
			state: "",
			prompt: "none",
			scope: ["identify", "guilds", "applications.commands", "rpc.voice.read"],
		});
		console.log("Code:", code);

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
		console.log("Access Token:", access_token);

		// Authenticate with Discord client (using the access_token)
        this.auth = await discordSdk.commands.authenticate({ access_token });
		// this.auth = await this.discordSdk.commands.authenticate({
		// 	access_token: accessToken,
		// });

		if (import.meta.env.DEV) {
            console.log("Using dev auth data");
            
			setHackData({
				isInitialized: true,
				cachedAuthData: this.auth!,
			});
		}

        return this.auth;
	}
}

export const discordSdk = new DiscordSDKManager();