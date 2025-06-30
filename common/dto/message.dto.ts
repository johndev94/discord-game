export default class Message<T> {
    messageType: string;
    channelId?: string;
    data: T;

    // TODO: Channel ID should not be allowed to be null.
    constructor(messageType: string, channelId: string, data: T) {
        this.messageType = messageType;
        this.channelId = channelId;
        this.data = data;
    }
}