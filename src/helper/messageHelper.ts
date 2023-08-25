import { MessageAPI } from '@api';
import { Message, UploadTask } from '@data-type';

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
        return [...state].filter(message => message.id !== payload.id);
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

export function handleGetMessageUploadTask(message: Message, uploadTasks: UploadTask[]): Message {
    if (message.type !== 'Files') return message;
    if (message.fileStatus === 'InProgress') {
        if (uploadTasks.length === 0) {
            MessageAPI.uploadFileMessageError(message.id);
            message = { ...message, fileStatus: 'Error' }
            return message;
        }
        const uploadTask = uploadTasks.find(ut => ut.messageId === message.id);
        if (!uploadTask) {
            MessageAPI.uploadFileMessageError(message.id);
            message = { ...message, fileStatus: 'Error' }
        } else {
            message.uploadTask = uploadTask;
        }
    }

    return message;
}