import PlayerDTO from "./player.dto";
import BoardDTO from "./board.dto";
import SpectatorDTO from "./spectator.dto";

export default class SessionDTO {
    players: PlayerDTO[];
    spectators: SpectatorDTO[];
    board: BoardDTO;
    gameOver: boolean;
    winner?: PlayerDTO;

    constructor(players: PlayerDTO[], spectators: SpectatorDTO[], board: BoardDTO, gameOver = false, winner = undefined) {
        this.players = players;
        this.spectators = spectators;
        this.board = board;
        this.gameOver = gameOver;
        this.winner = winner;
    }
}