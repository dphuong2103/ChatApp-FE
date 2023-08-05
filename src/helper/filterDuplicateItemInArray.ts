import { ChatRoomSummary } from '../types/dataType';

export function sortChatRoomSummary(chatRoomSummaries: ChatRoomSummary[]): ChatRoomSummary[] {
    chatRoomSummaries = chatRoomSummaries.sort((a, b) => {
        if (!!a.latestMessage?.createdTime && !!b.latestMessage?.createdTime) {
            const dateA = new Date(a.latestMessage.createdTime);
            const dateB = new Date(b.latestMessage.createdTime);
            return (dateB.getTime()) - (dateA.getTime());
        }
        if (!!a.latestMessage?.createdTime && b.latestMessage?.createdTime == null) {
            return -1;
        }
        if (a.latestMessage?.createdTime == null && !!b.latestMessage?.createdTime) {
            return 1;
        }
        else return 0;
    })
    return chatRoomSummaries;
}
