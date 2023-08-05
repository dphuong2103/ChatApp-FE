import store from '../redux/store';
import { ChatRoomSummary, Friend, UserRelationship } from '../types/dataType';

export function getContactAndChatRooms(relationships: UserRelationship[], chatRoomSummaries: ChatRoomSummary[]): Friend[] {
    const currentUserId = store.getState().auth.user?.id;
    if (!currentUserId) return [];
    let contacts: Friend[] = [];
    let friendRelationships = relationships.filter(relationship => relationship.relationshipType === 'E_FRIEND' && relationship.status === 'E_ACCEPTED');
    console.log(friendRelationships);
    if (friendRelationships.length < 1) return [];
    for (var relationship of friendRelationships) {
        let targetUser = relationship.initiatorUserId === currentUserId ? relationship.targetUser : relationship.initiatorUser;
        if (!targetUser) continue;
        let chatRoomSummary = chatRoomSummaries.find(chatRoomSummary => chatRoomSummary.chatRoom.chatRoomType === 'ONE' && chatRoomSummary.users.findIndex(user => user.id === targetUser!.id) > -1);
        let contact: Friend = {
            user: targetUser,
            chatRoomSummary: chatRoomSummary
        }
        contacts.push(contact);
    }
    return contacts;
}