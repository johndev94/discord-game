import { useState, useEffect } from "react";
import { discordSdk } from "./DiscordSDKHack";
import PlayerDTO from "@common/dto/player.dto";
import JoinDTO from "@common/dto/join.dto";
import UpdateDTO from "@common/dto/update.dto";
import Message from "@common/dto/message.dto";
import MESSAGE_TYPE from "@common/enum/message-types.enum";
import Connect4Game from "./ConnectFour";

function App() {
	// Will eventually store the authenticated user's access_token
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [messages, setMessages] = useState<string[]>([]);
	const [input, setInput] = useState("");

	const [currentUser, setCurrentUser] = useState<PlayerDTO>(); // The current user
	const [players, setPlayers] = useState<PlayerDTO[]>([]); // Ensure players is always an array
	const [channel, setChannel] = useState<any | null>(null); // The channel ID of the current user

	useEffect(() => {
		const ws = new WebSocket(`/.proxy/ws`);

		ws.onopen = async () => {
			console.log("Connected to WebSocket server");

			if (!currentUser) {
				const auth = await discordSdk.initialize();
				setCurrentUser({
					playerId: auth?.user.id,
					username: auth?.user.global_name ?? undefined,
					avatar: `https://cdn.discordapp.com/avatars/${auth?.user.id}/${auth?.user.avatar}.png`,
				});
			}

			const channel = await getCurrentVoiceChannel();

			if (channel !== null) {
				setChannel(channel);
				console.log("Channel ID:", channel?.id);
			}

			let joinSession: Message<JoinDTO> = {
				messageType: MESSAGE_TYPE.JOIN_SESSION,
				channelId: channel?.id,
				data: {
					username: currentUser?.username || "",
					channelName: channel?.name || "",
				},
			};

			ws.send(JSON.stringify(joinSession));
		};

		// TODO: What happends if I try to convert the any to a JoinDTO or UpdateDTO
		ws.onmessage = (event) => {
			let data: Message<any> = JSON.parse(event.data);
			console.log("Data received:", data);
			if (data.messageType === MESSAGE_TYPE.JOIN_SESSION) {
				setPlayers(data.data.players);
			} else if (data.messageType === MESSAGE_TYPE.UPDATE_SESSION) {
				setMessages((prevMessages) => [...prevMessages, data.data.message]);
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
			let updateMessage: Message<UpdateDTO> = {
				messageType: MESSAGE_TYPE.UPDATE_SESSION,
				channelId: channel?.id,
				data: {
					username: currentUser?.username ?? "",
					message: input,
				},
			};

			socket.send(JSON.stringify(updateMessage));

			setInput("");
		}
	};

	console.log(currentUser?.avatar);

	return (
		<div id="app">
			<h1>Current User: {currentUser?.username}</h1>
			<img src={currentUser?.avatar} className="logo" alt="User Avatar" />

			<p>Channel name: {channel ? channel.name : "No channel"}</p>
			<h2>Players:</h2>
			<ul>
				{/* Need to return the player count from the server */}
				{players?.map((player) => (
					<li key={player.playerId}>{player.username}</li>
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
			<div>
				<Connect4Game />
			</div>
		</div>
	);
}

export default App;
