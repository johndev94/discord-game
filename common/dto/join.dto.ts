export default class JoinDTO {
    username: string;
    channelName: string;

    constructor(username: string, channelName: string) {
        this.username = username;
        this.channelName = channelName;
    }
}