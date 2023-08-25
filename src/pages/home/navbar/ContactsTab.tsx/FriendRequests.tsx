import { useEffect, useState } from 'react';
import { UserRelationship } from '@data-type';
import { useChatRoomSummaryContext } from '@helper/getContext';
import { useAppSelector } from '../../../../redux/store';
import FriendRequest from './FriendRequest';

function FriendRequests() {
    const currentUser = useAppSelector(state => state.auth.user);
    const [friendRequests, setFriendRequests] = useState<Request[]>([]);
    const { relationships } = useChatRoomSummaryContext();

    useEffect(() => {
        if (!currentUser) return;
        let friendRequests: Request[] = relationships.map(relationship => {
            if (relationship.targetUserId === currentUser.id && relationship.relationshipType === 'E_FRIEND' && relationship.status === 'E_PENDING') {
                return {
                    relationship: relationship,
                    type: 'receive'
                }
            } else if (relationship.initiatorUserId === currentUser.id && relationship.relationshipType === 'E_FRIEND' && relationship.status === 'E_PENDING') {
                return {
                    relationship: relationship,
                    type: 'request'
                }

            } else {
                return {
                    relationship: relationship,
                    type: 'unknown'
                }
            }
        });

        setFriendRequests(friendRequests);
    }, [relationships])

    return <div>
        {friendRequests.map(friendRequest => <FriendRequest friendRequest={friendRequest.relationship} key={friendRequest.relationship.id} type={friendRequest.type} />)}
    </div>
}
export default FriendRequests;

type Request = {
    relationship: UserRelationship;
    type: 'request' | 'receive' | 'unknown';
}