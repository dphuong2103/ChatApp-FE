import { Message } from '../types/dataType';

export function sortMessages(messages: Message[]): Message[] {
    return messages.sort((a, b) => {
        const aDate = new Date(a.createdTime);
        const bDate = new Date(b.createdTime);
        return aDate.getTime() - bDate.getTime();
    });
}
export function handleGetRepliedMessages(messages: Message[]) {
    return messages.map(message => {
        if (!message.replyToMessageId) return message;
        if (message.replyToMessageId && message.replyToMessage) return message;
        let replyToMessage = messages.find(m => m.id === message.replyToMessageId);
        message.replyToMessage = replyToMessage;
        return message;
    })
}

export function handleUpsertOrDeleteMessage(state: Message[], payload: Message) {
    if (payload.isDeleted) {
        state = state.filter(message => message.id !== payload.id);
        return state;
    }
    let messageExists = false;
    payload = handleGetRepliedMessage(payload, state);
    const updatedState = state.map(message => {
        if (message.id === payload.id) {
            messageExists = true;
            return { ...payload }
        } else {
            return message;
        }
    })
    if (!messageExists) {
        return [...updatedState, payload]
    }
    else {
        return updatedState;
    }

}

export function handleTransFormMessages(messages: Message[]) {
    return sortMessages(handleGetRepliedMessages(messages));
}

export function handleGetRepliedMessage(originalMessage: Message, messages: Message[]) {
    if (originalMessage.replyToMessageId) {
        for (let message of messages) {
            if (message.id === originalMessage.replyToMessageId) {
                originalMessage.replyToMessage = message;
                break;
            }
        }
    }
    return originalMessage;
}