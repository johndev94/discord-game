import { useState, useEffect } from "react";
import { discordSdk } from "./DiscordSDKHack";
import PlayerDTO from "@common/dto/player.dto";
import Message from "@common/dto/message.dto";
import MESSAGE_TYPE from "@common/enum/message-types.enum";
import Connect4Game from "./ConnectFour";
import SessionDTO from "@common/dto/session.dto";
import JoinSessionDTO from "@common/dto/join-session.dto";
import UserDTO from "@common/dto/user.dto";
import SpectatorDTO from "@common/dto/spectator.dto";
import BoardDTO from "@common/dto/board.dto";

function App() {
	// Will eventually store the authenticated user's access_token
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [channel, setChannel] = useState<any | null>(null); // The channel ID of the current user

	const [messages, setMessages] = useState<string[]>([]); // For messaging test
	const [input, setInput] = useState(""); // For messaging test

	const [currentUser, setCurrentUser] = useState<UserDTO>(); // The current user
	const [players, setPlayers] = useState<PlayerDTO[]>([]); // Ensure players is always an array
	const [spectators, setSpectators] = useState<SpectatorDTO[]>([]);
	const [board, setBoard] = useState<BoardDTO>();

	useEffect(() => {
		const ws = new WebSocket(`/.proxy/ws`);

		ws.onopen = async () => {
			console.log("Connected to WebSocket server");

			if (!currentUser) {
				const auth = await discordSdk.initialize();
				let player: UserDTO = new UserDTO(
					auth?.user.id,
					auth?.user.global_name ?? undefined,
					auth?.user.avatar ?? undefined
				);

				setCurrentUser(player);
			}

			const channel = await getCurrentVoiceChannel();

			if (channel !== null) {
				setChannel(channel);
			}

			let joinSession: Message<JoinSessionDTO> = new Message<JoinSessionDTO>(
				MESSAGE_TYPE.JOIN_SESSION,
				channel?.id,
				new JoinSessionDTO(
					new SpectatorDTO(
						currentUser?.playerId!,
						currentUser?.username!,
						currentUser?.avatar!
					)
				)
			);

			ws.send(JSON.stringify(joinSession));
		};

		ws.onmessage = (event) => {
			let data: Message<any> = JSON.parse(event.data);
			console.log("Data received:", data);
			if (data.messageType === MESSAGE_TYPE.JOIN_SESSION) {
				let sessionData = data.data as SessionDTO
				setPlayers(sessionData.players);
				setSpectators(sessionData.spectators);
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
			let updateMessage: Message<SessionDTO> = new Message<SessionDTO>(
				MESSAGE_TYPE.UPDATE_SESSION,
				channel?.id
			);
			// {
			// 	messageType: MESSAGE_TYPE.UPDATE_SESSION,
			// 	channelId: channel?.id,
			// 	data: {
			// 		username: currentUser?.username ?? "",
			// 		message: input,
			// 	},
			// };

			socket.send(JSON.stringify(updateMessage));

			setInput("");
		}
	};

	console.log(currentUser?.avatar);

	return (
		<div id="app">
			<h1>Current User: {currentUser?.username}</h1>
			<img
				src={currentUser?.avatar ?? undefined}
				className="logo"
				alt="User Avatar"
			/>

			<p>Channel name: {channel ? channel.name : "No channel"}</p>

			<h2>Specatators:</h2>
			<ul>
				{spectators?.map((spectator) => (
					<li key={spectator.playerId}>{spectator.username}</li>
				))}
			</ul>

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
