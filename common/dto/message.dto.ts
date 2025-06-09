export default class Message<T> {
    messageType: string;
    channelId?: string;
    data?: T;

    constructor(messageType: string, channelId?: string, data?: T) {
        this.messageType = messageType;
        this.channelId = channelId;
        this.data = data;
    }
}