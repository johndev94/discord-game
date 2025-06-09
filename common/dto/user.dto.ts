export default class UserDTO {
    playerId?: string;
    username?: string;
    avatar?: string;

    constructor(playerId?: string, username?: string, avatar?: string) {
        this.playerId = playerId;
        this.username = username;
        this.avatar = avatar;
    }
}