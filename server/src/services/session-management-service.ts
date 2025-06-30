
import { WebSocket } from "ws";
import Message from "@common/dto/message.dto";
import SessionDTO from "@common/dto/session.dto";
import BoardDTO from "@common/dto/board.dto";
import JoinSessionDTO from "@common/dto/join-session.dto";
import SpectatorDTO from "@common/dto/spectator.dto";
import PlayerMoveDTO from "@common/dto/player-move.dto"
import GameSessionEntity from "../entity/game-session.entity";
import processPlayerMove from "./game-state-service"

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
        const joinChannelID = joinMessage.channelId;

        if (!joinChannelID) return;

        let session = this.sessions.get(joinChannelID);

        if (!session) {
            const sessionDTO = new SessionDTO(
                [],
                [joinMessage.data.spectator],
                new BoardDTO()
            );
            session = new GameSessionEntity([ws], sessionDTO);
            this.sessions.set(joinChannelID, session);
        } else {
            if (!session.clients.includes(ws)) {
                session.clients.push(ws);
            }

            const newSpectator = joinMessage.data?.spectator;
            if (newSpectator && !session.sessionData.spectators.some(spectator => spectator.playerId === newSpectator.playerId)) {
                session.sessionData.spectators.push(newSpectator);
            }
        }

        const joinSessionMessage = new Message<SessionDTO>(
            joinMessage.messageType,
            joinChannelID,
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

        if (gameSession) {
            gameSession.clients.forEach((client: WebSocket) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(updateSessionDTO));
                }
            });
        }
    }

    playerMove(playerMoveDTO: Message<PlayerMoveDTO>) {
        console.info("INFO: Updating session", playerMoveDTO);
        const gameSession = this.sessions.get(playerMoveDTO?.channelId!);

        if (!gameSession) return;
        if (!playerMoveDTO.data) return;

        gameSession.sessionData = processPlayerMove(playerMoveDTO.data);

        if (gameSession) {
            gameSession.clients.forEach((client: WebSocket) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(playerMoveDTO));
                }
            });
        }
    }

    endSession(endSessionDTO: any, ws: WebSocket) {
        console.info("Ending session", endSessionDTO);
    }
}

export default SessionManagementService.getInstance();