import PlayerDTO from "./player.dto";
import BoardDTO from "./board.dto";
import SpectatorDTO from "./spectator.dto";

export default class SessionDTO {
    players: PlayerDTO[];
    spectators: SpectatorDTO[];
    board: BoardDTO;

    constructor(players: PlayerDTO[], spectators: SpectatorDTO[], board: BoardDTO) {
        this.players = players;
        this.spectators = spectators;
        this.board = board;
    }
}
