import { ChatRoom, ChatRoomSummary, NewChat, User } from '../types/dataType';

export function isChatRoom(object: unknown): object is ChatRoom {
    if (object != null && typeof object === "object") {
        return "id" in object && "name" in object;
    }
    return false;
}

export function isChatRoomSummary(object: unknown): object is ChatRoomSummary {
    if (object != null && typeof object === "object") {
        return 'chatRoom' in object && 'users' in object;
    }
    return false;
}

export function isNewChat(object: unknown): object is NewChat {
    return object != null && typeof object === "object" && 'users' in object;
}

export function isUser(object: unknown): object is User {
    if (object != null && typeof object === "object") {
        return 'email' in object;
    }
    else return false;
}

