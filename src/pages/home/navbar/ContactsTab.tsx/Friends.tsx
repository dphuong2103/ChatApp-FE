import { useEffect, useState } from 'react';
import styles from '../../../../styles/Friends.module.scss';
import { ChatRoomType, NewChatRoomAndUserList, Friend as TFriend } from '@data-type';
import { useChatRoomSummaryContext, useCurrentChatRoomContext } from '@helper/getContext';
import { getContactAndChatRooms } from '@helper/contactHelper';
import Friend from './Friend';
import { useSearchInput } from './ContactTab';
import { stringContains } from '@helper/stringHelper';
import { toast } from 'react-toastify';
import { ChatRoomAPI } from '@api';
import { useAppSelector } from '../../../../redux/store';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@hooks/useApi';

function Friends() {
    const [friends, setFriends] = useState<TFriend[]>([]);
    const [filteredFriends, setFilteredFriends] = useState<TFriend[]>([]);
    const { relationships, chatRoomSummaries } = useChatRoomSummaryContext();
    const { handleSetCurrentChatRoomSummary } = useCurrentChatRoomContext();
    const { searchInput } = useSearchInput();
    const currentUserId = useAppSelector(state => state.auth.user?.id);
    const navigate = useNavigate();

    useEffect(() => {
        handleFilterFriends();
        function handleFilterFriends() {
            if (!searchInput) { setFilteredFriends([...friends]); return; };
            let filter = friends.filter(friend => stringContains(friend.user.displayName, searchInput) || stringContains(friend.user.email, searchInput));
            setFilteredFriends([...filter])
        }
    }, [searchInput, friends])

    async function handleUserClick(friend: TFriend) {
        if (friend.chatRoomSummary) {
            handleSetCurrentChatRoomSummary(friend.chatRoomSummary);
        }
        else {
            const newChatRoomAndUserList: NewChatRoomAndUserList = {
                newChatRoom: {
                    chatRoomType: ChatRoomType.ONE,
                    creatorId: currentUserId ?? '',
                },
                userIds: [currentUserId!, friend.user.id]
            }
            await apiRequest({
                request: () => ChatRoomAPI.addNewChatRoom(newChatRoomAndUserList),
                onFinish: (data) => {
                    data && handleSetCurrentChatRoomSummary(data)
                    navigate('/home/chatlist/chatrooms')
                },
                onError: () => {
                    toast.error('Error creating new chat, please try again!')
                }
            });
        }

    }

    useEffect(() => {
        if (!(relationships.length > 0) || !(chatRoomSummaries.length > 0)) return;
        setFriends([...getContactAndChatRooms(relationships, chatRoomSummaries)])
    }, [relationships, chatRoomSummaries])

    return <div className={styles['friends-container']}>
        {filteredFriends.map((friend) => <Friend friend={friend} key={friend.user.id} onClick={handleUserClick} />)}
    </div>
}
export default Friends;