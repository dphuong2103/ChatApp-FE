import store from '../redux/store';
import { RelationshipStatus, UserRelationship } from './../types/dataType';

export function getRelationship(currentUserId: string, targetUserId: string, userRelationships: UserRelationship[]) {
    if (userRelationships.length == 0) return;
    const relationship = userRelationships.find(relationship => (
        relationship.initiatorUserId === currentUserId && relationship.targetUserId === targetUserId) ||
        relationship.targetUserId === currentUserId && relationship.initiatorUserId === targetUserId
    );
    return relationship || null;
}

export function getRelationshipStatus(relationship?: UserRelationship | null): RelationshipStatus {
    const currentUserId = store.getState().auth.user?.id;
    if (!relationship) {
        return 'NotFriend';
    }
    if (relationship.status === 'E_PENDING') {
        if (relationship.initiatorUserId === currentUserId) {
            return 'RequestSent'
        }
        if (relationship.targetUserId === currentUserId) {
            return 'RequestReceived';
        }
    }
    else if (relationship.status === 'E_ACCEPTED') {
        return 'Friend';
    }

    return 'Unknown'
}

