import PlayerDTO from "./player.dto";
import SessionDTO from "./session.dto"

export default class PlayerMoveDTO {
    playerSelectedColomn: number;
    session: SessionDTO;

    constructor(playerSelectedColomn: number, session: SessionDTO) {
        this.playerSelectedColomn = playerSelectedColomn;
        this.session = session;

    }
}