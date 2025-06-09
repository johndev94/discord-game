export default class Message<T> {
    messageType: string;
    channelId?: string;
    data: T;

    constructor(messageType: string, data: T, channelId?: string) {
        this.messageType = messageType;
        this.data = data;
        this.channelId = channelId;
    }
}