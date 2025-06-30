import UserDTO from "./user.dto";
import BOARD from "../enum/board-colour.enum"

export default class PlayerDTO extends UserDTO {
    colour: BOARD.RED | BOARD.YELLOW;
    isTurn: boolean;
    score: number;

    constructor(playerId: string, username: string, avatar: string, colour: BOARD.RED | BOARD.YELLOW, isTurn: boolean, score: number) {
        super(playerId, username, avatar);
        this.colour = colour;
        this.isTurn = isTurn;
        this.score = score;
    }
}