import { WebSocket } from "ws";
import Message from "@common/dto/message.dto";
import MESSAGE_TYPE from "@common/enum/message-types.enum";
import sessionManagementService from "./session-management-service";

export function handleMessage(data: Message<any>, ws: WebSocket) {
	switch (data.messageType) {
		case MESSAGE_TYPE.JOIN_SESSION:
			sessionManagementService.joinSession(data, ws);
			break;
		case MESSAGE_TYPE.START_SESSION:
			sessionManagementService.startSession(data, ws);
			break;
		case MESSAGE_TYPE.UPDATE_SESSION:
			sessionManagementService.updateSession(data);
			break;
		case MESSAGE_TYPE.END_SESSION:
			sessionManagementService.endSession(data, ws);
			break;
		default:
			console.info("Unknown message type");
			break;
	}
}