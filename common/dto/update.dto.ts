// TODO: Remove this when messaging test for Websockets is done
export default class UpdateDTO {
    username: string;
    message: string;

    constructor(username: string, message: string) {
        this.username = username;
        this.message = message;
    }
}
