export default class UserDTO {
    playerId?: string | null;
    username?: string | null;
    avatar?: string | null;

    constructor(playerId?: string, username?: string, avatar?: string) {
        this.playerId = playerId ?? undefined;
        this.username = username ?? undefined;
        this.avatar = avatar !== null ? `https://cdn.discordapp.com/avatars/${playerId}/${avatar}` : undefined;
    }
}