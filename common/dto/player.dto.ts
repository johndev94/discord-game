import UserDTO from "./user.dto";

export default class PlayerDTO extends UserDTO {
    color?: "red" | "yellow";
    isTurn?: boolean;
    score?: number;

    constructor(playerId?: string, username?: string, avatar?: string, color?: "red" | "yellow", isTurn?: boolean, score?: number) {
        super(playerId, username, avatar);
        this.color = color;
        this.isTurn = isTurn;
        this.score = score;
    }
}