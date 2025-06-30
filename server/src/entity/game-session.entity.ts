import { WebSocket } from 'ws';
import SessionDTO from "@common/dto/session.dto"

export default class GameSessionEntity {
    clients: WebSocket[];
    sessionData: SessionDTO;

    constructor(clients: WebSocket[], sessionData: SessionDTO) {
        this.clients = clients;
        this.sessionData = sessionData;
    }
}