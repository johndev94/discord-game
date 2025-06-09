
// // This file will host the logic for the Webscoket messages recived on the server side. 
// import Message from "@common/dto/message.dto"
// import MESSAGE_TYPE from "@common/enum/message-types.enum";

// function processMessage(data : Message<any>, ws: WebSocket){

//     switch (data.messageType) {
//         case MESSAGE_TYPE.JOIN_SESSION: 
//             joinSession(data, ws);
//             break;
        
//         case MESSAGE_TYPE.START_SESSION: 
//             startSession(data, ws);
//             break;
        
//         case MESSAGE_TYPE.UPDATE_SESSION: 
//             updateSession(data, ws);
//             break;
        
//         case MESSAGE_TYPE.END_SESSION: 
//             endSession(data, ws);
//             break;
        
//         default: 
//             console.info("Unknown message type");
//             break;
//     }
// }


// // When the message type is join_session, we need to add the player to the session.
// function joinSession(joinDTO : Message<JoinDTO>, ws : WebSocket) {
//   console.info("Joining session... Channel ID: " + joinDTO.channelId + " Username: " + joinDTO.data.username);

//   if (!sessions.has(joinDTO.channelId)) {
//     console.info("INFO: Creating new session");

//     sessions.set(joinDTO.channelId, {
//       clients: [ws],
//       players: [{ username: joinDTO.data.username }], // We will make a PlayerEntity later 
//       board: [] // We will make a BoardDTO later or a gamestate object.
//     });

//     console.log("INFO: Current Session after creating: ");
//     console.log(sessions.get(joinDTO.channelId));

//   } else {
//     console.info("INFO: Adding player to session");
//     let session = sessions.get(joinDTO.channelId);
  
//     if (!session.clients.includes(ws)) {
//       session.clients.push(ws);
//     }

//     //TODO: Should not do one or the other, must be both or none.
//     if (!session.players.find((p : any) => p.username === joinDTO.data.username)) {
//       session.players.push({ name: joinDTO.data.username }); // Push a new player object to the players later. 
//     }
//   }

//   let joiningSession = sessions.get(joinDTO.channelId);

//   joiningSession.clients.forEach((client : WebSocket) => {
//     // May want to standertise this message object later as a DTO or WS message object.
//     client.send(JSON.stringify(joinDTO));
//   });
// }

// // TODO
// function startSession(startSessionDTO : any, ws : WebSocket) {
//   console.info("Starting session");
// }

// function updateSession(updateSessionDTO: Message<UpdateDTO>, ws : WebSocket, session : any) {
//   console.info("INFO: Updating session", updateSessionDTO);
  
//   let gameSession = sessions.get(updateSessionDTO.channelId);

//   gameSession.clients.forEach((client : WebSocket) => {
//     console.log(`Sending message to client`);
//     client.send(JSON.stringify(updateSessionDTO)); // This will be game session data later.
//   });
// }

// // TODO 
// function endSession(endSessionDTO: any, ws : WebSocket) {
//   console.info("Ending session", endSessionDTO);
// }