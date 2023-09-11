import store from '../redux/store';
import { ChatRoomInfo, ChatRoomSummary, ChatRoomType, RelationshipStatus, User, UserRelationship } from '@data-type';
import { stringContains } from './stringHelper';
import { isChatRoomSummary, isUser } from './checkType';
import { getRelationship, getRelationshipStatus } from './relationshipHelper';


export function getChatRoomInfo(chatRoomSummary: ChatRoomSummary, relationships?: UserRelationship[]): ChatRoomInfo {
    const useSelector = store.getState();
    const currentUserId = useSelector.auth.user?.id;
    let name = '';
    let imgUrl: string | undefined | null;

    if (isChatRoomSummary(chatRoomSummary) && chatRoomSummary.chatRoom.name != null && chatRoomSummary.chatRoom.name !== '') {
        name = chatRoomSummary.chatRoom.name
    }
    else {
        chatRoomSummary.users.forEach(user => {
            if (user.id !== currentUserId) {
                name = user.displayName;
                imgUrl = user.photoUrl;
            }
        })
    }
    if (name === '') {
        name = useSelector.auth.user?.displayName ?? '';
    }

    if (isChatRoomSummary(chatRoomSummary) && chatRoomSummary.chatRoom.photoUrl) {
        imgUrl = chatRoomSummary.chatRoom.photoUrl;
    }

    const partners = chatRoomSummary.users.filter(u => u.id !== currentUserId);
    let relationship: UserRelationship | undefined;
    let relationshipStatus: RelationshipStatus | undefined;
    if (chatRoomSummary.chatRoom.chatRoomType === "ONE" && relationships) {
        relationship = getRelationship(currentUserId!, partners[0].id, relationships) ?? undefined;
        relationshipStatus = getRelationshipStatus(relationship);
    }

    return {
        name,
        imgUrl,
        partners: partners,
        relationship: relationship,
        relationshipStatus: relationshipStatus
    }
}

export function getPartner(users: User[]): User | undefined {
    const useSelector = store.getState();
    const currentUserId = useSelector.auth.user?.id;
    const partner = users.find(user => user.id !== currentUserId);
    return partner;
}

export function filterChatRoom(chatRoomSummaries: ChatRoomSummary[], filterValue: string) {
    const useSelector = store.getState();
    const currentUserId = useSelector.auth.user?.id;
    return chatRoomSummaries.filter(cr => {

        if (stringContains(cr.chatRoom.name, filterValue)) {
            return true;
        }
        for (var u of cr.users) {
            if (u.id !== currentUserId && (stringContains(filterValue, u.displayName) || stringContains(filterValue, u.email))) {
                return true;
            }
        }

        return false;
    });
}

export function removeDuplicateChat(searchLists: (ChatRoomSummary | User)[], users: User[]) {
    const useSelector = store.getState();
    const currentUserId = useSelector.auth.user?.id;
    users = users.filter(u => u.id !== currentUserId);
    for (var user of users) {
        let exists = false;
        for (var c of searchLists) {
            if (isUser(c)) {
                if (users.findIndex(u => u.id === (c as User).id) >= 0) exists = true;
            }
            if (isChatRoomSummary(c) && c.chatRoom.chatRoomType === ChatRoomType.ONE) {
                if (c.users.findIndex(u => u.id === user.id) >= 0) exists = true;
            }
        }
        if (!exists) {
            searchLists.push(user)
        }
    }
    return searchLists;
}

export function getChatRoomSummaryByChatRoomId(chatRoomSummaries: ChatRoomSummary[], chatRoomId: string): ChatRoomSummary | null {
    let chatRoomSummary: ChatRoomSummary | null = null;
    for (let crs of chatRoomSummaries) {
        if (crs.chatRoom.id === chatRoomId) {
            chatRoomSummary = crs
        }
    }
    return chatRoomSummary;
}

export function getChatRoomAndUserListByUserIdFromChatRoomSummaries(userId: string, chatRoomSummaries: ChatRoomSummary[]): ChatRoomSummary | null {
    let chatRoomSummary = chatRoomSummaries.find(crs => crs.chatRoom.chatRoomType === 'ONE' && crs.users.findIndex(u => u.id === userId) > -1);
    if (!chatRoomSummaries) return null;
    return {
        chatRoom: chatRoomSummary!.chatRoom,
        users: chatRoomSummary!.users,
        userChatRoom: chatRoomSummary!.userChatRoom,
    }
}   