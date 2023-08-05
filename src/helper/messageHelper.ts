import { Message } from '../types/dataType';

export function sortMessages(messages: Message[]): Message[] {
    return messages.sort((a, b) => {
        const aDate = new Date(a.createdTime);
        const bDate = new Date(b.createdTime);
        return aDate.getTime() - bDate.getTime();
    })
}

export function handleGetReplyToMessage(messages: Message[]) {
    return messages.map(message => {
        if (!message.replyToMessageId) return message;
        if (message.replyToMessageId && message.replyToMessage) return message;
        var replyToMessage = messages.find(m => m.id === message.replyToMessageId);
        message.replyToMessage = replyToMessage;
        return message;
    })
}

export function handleUpsertOrDeleteMessage(state: Message[], payload: Message) {
    if (payload.isDeleted) {
        state = state.filter(message => message.id !== payload.id);
        return state;
    }

    var messageExists = false;

    state.map(message => {
        if (message.id === payload.id) {
            messageExists = true;
            return payload
        } else {
            return message;
        }
    })
    if (!messageExists) {
        state.push(payload);
    }
    return state;
}

export function handleTransFormMessages(messages: Message[]) {
    return sortMessages(handleGetReplyToMessage(messages));
}