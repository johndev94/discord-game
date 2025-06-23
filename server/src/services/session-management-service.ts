
import { WebSocket } from "ws";
import Message from "@common/dto/message.dto";
import SessionDTO from "@common/dto/session.dto";
import BoardDTO from "@common/dto/board.dto";
import JoinSessionDTO from "@common/dto/join-session.dto";
import SpectatorDTO from "@common/dto/spectator.dto";
import GameSessionEntity from "../entity/game-session.entity";

class SessionManagementService {

    private static instance: SessionManagementService;
    private sessions: Map<string, GameSessionEntity>;

    private constructor() {
        this.sessions = new Map<string, GameSessionEntity>;
    }

    public static getInstance(): SessionManagementService {
        if (!SessionManagementService.instance) {
            SessionManagementService.instance = new SessionManagementService();
        }
        return SessionManagementService.instance;
    }

    joinSession(joinMessage: Message<JoinSessionDTO>, ws: WebSocket) {
        let session = this.sessions.get(joinMessage.channelId!);

        if (!session) {
            const sessionDTO = new SessionDTO(
                [],
                [joinMessage.data?.spectator!],
                new BoardDTO()
            );
            session = new GameSessionEntity([ws], sessionDTO);
            this.sessions.set(joinMessage.channelId!, session);
        } else {
            if (!session.clients.includes(ws)) {
                session.clients.push(ws);
            }

            // Check if the user is already in the spectators list by their `playerId` or `username`
            const newSpectator = joinMessage.data?.spectator;
            if (newSpectator && !session.sessionData.spectators.some(spectator => spectator.playerId === newSpectator.playerId)) {
                session.sessionData.spectators.push(newSpectator);
            }
        }

        const joinSessionMessage = new Message<SessionDTO>(
            joinMessage.messageType,
            joinMessage.channelId,
            session.sessionData
        );

        session.clients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(joinSessionMessage));
            }
        });
    }

    startSession(startSessionDTO: any, ws: WebSocket) {
        console.info("Starting session");
    }

    updateSession(updateSessionDTO: Message<SessionDTO>) {
        console.info("INFO: Updating session", updateSessionDTO);

        const gameSession = this.sessions.get(updateSessionDTO?.channelId!);

        // I want to do game validation here such as updating peices placed, winners, lossers
        // points, players, spectators, and maybe people in the queue.

        // let updateSessionDTO = processSession(updateSessionDTO);

        if (gameSession) {
            gameSession.clients.forEach((client: WebSocket) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(updateSessionDTO));
                }
            });
        }
    }

    endSession(endSessionDTO: any, ws: WebSocket) {
        console.info("Ending session", endSessionDTO);
    }
}

export default SessionManagementService.getInstance();