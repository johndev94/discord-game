import UserDTO from "./user.dto";

export default class SpectatorDTO extends UserDTO {
    constructor(playerId?: string, username?: string, avatar?: string) {
        super(playerId, username, avatar);
        // Additional logic if needed
    }
}
