import { useState, useEffect } from "react";
import { discordSdk } from "../DiscordSDKHack";
import Message from "@common/dto/message.dto";
import MESSAGE_TYPE from "@common/enum/message-types.enum";
import JoinSessionDTO from "@common/dto/join-session.dto";
import SessionDTO from "@common/dto/session.dto";
import SpectatorDTO from "@common/dto/spectator.dto";
import PlayerDTO from "@common/dto/player.dto";

function useWebSocket(currentUser: any, setChannel: (channel: any) => void) {
  const [players, setPlayers] = useState<PlayerDTO[]>([]);
  const [spectators, setSpectators] = useState<SpectatorDTO[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const ws = new WebSocket(`/.proxy/ws`);

    ws.onopen = async () => {
      console.log("Connected to WebSocket server");

      const retrievedChannel = await getCurrentVoiceChannel();
      if (retrievedChannel !== null) {
        setChannel(retrievedChannel);
      }

      const joinSession: Message<JoinSessionDTO> = new Message<JoinSessionDTO>(
        MESSAGE_TYPE.JOIN_SESSION,
        retrievedChannel?.id,
        new JoinSessionDTO(
          new SpectatorDTO(
            currentUser.playerId!,
            currentUser.username!,
            currentUser.avatar!
          )
        )
      );

      ws.send(JSON.stringify(joinSession));
    };

    ws.onmessage = (event) => {
      const data: Message<any> = JSON.parse(event.data);
      console.log("Data received:", data);

      if (data.messageType === MESSAGE_TYPE.JOIN_SESSION) {
        const sessionData = data.data as SessionDTO;
        setPlayers(sessionData.players);
        setSpectators(sessionData.spectators);
      } else if (data.messageType === MESSAGE_TYPE.UPDATE_SESSION) {
        setMessages((prevMessages) => [...prevMessages, data.data.message]);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [currentUser]);

  return { players, spectators, messages, socket };
}

async function getCurrentVoiceChannel() {
  if (!discordSdk.channelId) {
    console.warn("Not in a voice channel");
    return null;
  }

  try {
    return await discordSdk.commands.getChannel({ channel_id: discordSdk.channelId });
  } catch (error) {
    console.error("Error fetching channel:", error);
    return null;
  }
}

export default useWebSocket;