import { DiscordSDK } from "@discord/embedded-app-sdk";

import rocketLogo from '/rocket.png';
import "./style.css";

// Will eventually store the authenticated user's access_token
let auth;
let activityChannelName = 'Unknown'; 

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
    scope: [
      "identify",
      "guilds",
      "applications.commands",
      "rpc.voice.read" 
    ],
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

  document.querySelector('#app').innerHTML = `
    <div>
      <img src="${rocketLogo}" class="logo" alt="Discord" />
      <h1>Fuck you Milky!</h1>
      <p>Server: ${activityChannelName}</p>
    </div>
  `;
}


async function appendVoiceChannelName() {
  console.log("Checking Discord SDK connection...");
  console.log("Channel ID:", discordSdk.channelId);
  console.log("Guild ID:", discordSdk.guildId);

  if (discordSdk.channelId && discordSdk.guildId) {
    try {
      console.log("Fetching channel details...");
      const channel = await discordSdk.commands.getChannel({ channel_id: discordSdk.channelId });
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


  document.querySelector('#app').innerHTML = `
    <div>
      <img src="${rocketLogo}" class="logo" alt="Discord" />
      <h1>Fuck you Milky!</h1>
      <p>Server: ${activityChannelName}</p>
    </div>
  `;
}
