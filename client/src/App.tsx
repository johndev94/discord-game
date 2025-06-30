import { useState, useEffect } from "react";
import useWebSocket from "./hooks/useWebSocket";
import { discordSdk } from "./DiscordSDKHack";
import UserDTO from "@common/dto/user.dto";
import Connect4Game from "./ConnectFour";
import PlayerDTO from "@common/dto/player.dto";
import Message from "@common/dto/message.dto";
import PlayerMoveDTO from "@common/dto/player-move.dto"
import MESSAGE_TYPE from "@common/enum/message-types.enum";
import SessionDTO from "@common/dto/session.dto";
import BoardDTO from "@common/dto/board.dto";

function App() {
  const [channel, setChannel] = useState<any | null>(null);
  // const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState<UserDTO>();

  const { players, spectators, messages, socket } = useWebSocket(currentUser, setChannel);

  useEffect(() => {
    const initializeUser = async () => {
      if (!currentUser) {
        const auth = await discordSdk.initialize();
        
        if(!auth) return; // TODO: This may cause problems

        const user = new UserDTO(auth?.user.id, auth?.user.global_name!, auth?.user.avatar!);

        setCurrentUser(user);
      }
    };
    initializeUser();
  }, [currentUser]);

  const updateBoard = () => {
    console.log("Updating the board");

    const playerMoveDTO = new PlayerMoveDTO(1, new SessionDTO(players, spectators, new BoardDTO()));
    const updateBoardMessage = new Message<PlayerMoveDTO>(
      MESSAGE_TYPE.PLAYER_MOVE,
      channel.id,
      playerMoveDTO
    );
    
    socket?.send(JSON.stringify(updateBoardMessage));
  };

  // TODO: Emulate the board.
  // Create a new click event. Send a message Type of UPDATE_SESSION and update the array AND send the current board.
  // The click will be 1 col or a random one, whichever is easier. I need validate the message being sent back and forth
  // the way I expect.


  return (
    <div id="app">
      -------------------------------------------------------------------------------------------
      <h1>DEBUGGING:</h1>
      <h1 className="h2">Current User: {currentUser?.username}</h1>
      {/* <img src={currentUser?.avatar ?? undefined} className="logo" alt="User Avatar" /> */}
      <p>Channel ID: {channel ? channel.id : "No channel"}</p>
      -------------------------------------------------------------------------------------------
      <br />
      
      <h2>Spectators:</h2>
      <ul>
        {spectators.map((spectator) => 
          <li key={spectator.playerId} className="flex items-center space-x-2">
            <img
              src={`https://cdn.discordapp.com/avatars/${spectator.playerId}/${spectator.avatar}`}
              className="w-8 h-8 rounded-full"  // Tailwind classes to make icon small and rounded
              alt={`${spectator.username} Avatar`}
            />
            <span>{spectator.username}</span>
          </li>
        )}
      </ul>
      
      <br />
      
      {players.length === 0 ? "" : 
        <>
          <h2>Players:</h2>
          <ul>{players.map((player : PlayerDTO) => <li key={player.playerId}>{player.username}</li>)}</ul>
        </>
      }

      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Join Game</button>

      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
        onClick={updateBoard}>
          Update Game Board
      </button>

      {/* <div>
        <h1>WebSocket Chat</h1>
        <div>{messages.map((msg, index) => <div key={index}>{msg}</div>)}</div>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." />
        <button onClick={sendMessage}>Send</button>
      </div> */}


      
      <div>
        <Connect4Game />
      </div>
    </div>
  );
}

export default App;