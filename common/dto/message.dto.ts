export default interface Message<T> { 
    messageType: string;
    channelId?: string;
    data: T;
}