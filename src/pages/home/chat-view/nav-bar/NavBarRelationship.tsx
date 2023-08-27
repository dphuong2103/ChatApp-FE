import { ChatRoomType, NewChatRoomAndUserList, User, UserRelationship } from '@data-type'
import { useAppSelector } from '../../../../redux/store';
import { generateClassName } from '@helper/generateClassName';
import styles from '@styles/NavBarRelationship.module.scss';
import { Typography, Button } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { ChatRoomAPI, UserRelationshipAPI } from '@api';
import { useCurrentChatRoomContext } from '@helper/getContext';
import { apiRequest } from '@hooks/useApi';
import { toast } from 'react-toastify';
function NavBarRelationship({ relationship, targetUser }: NavBarRelationshipProps) {
  const { newChat, handleSetCurrentChatRoomSummary, currentChatRoomInfo } = useCurrentChatRoomContext();
  const currentUser = useAppSelector(state => state.auth.user);

  async function handleSendFriendRequest() {
    if (!currentUser || !targetUser?.id) return;

    if (newChat) {
      await handleCreateChatRoom();
      return;
    }

    await apiRequest({ request: () => UserRelationshipAPI.sendFriendRequest(currentUser.id, targetUser.id) })
  }

  async function handleCreateChatRoom() {
    const newChatRoomAndUserList: NewChatRoomAndUserList = {
      newChatRoom: {
        chatRoomType: ChatRoomType.ONE,
        creatorId: currentUser!.id
      },
      userIds: [currentUser!.id, targetUser!.id]
    };

    const { data: newChatRoomSummary } = await apiRequest({
      request: () => ChatRoomAPI.addNewChatRoom(newChatRoomAndUserList),
      onError: () => toast.error('Error creating new chat, please try again!')
    });

    if (newChatRoomSummary) {
      handleSetCurrentChatRoomSummary(newChatRoomSummary)
      await UserRelationshipAPI.sendFriendRequest(currentUser!.id, targetUser!.id);
    }
  }

  async function handleCancelFriendRequest() {
    if (!relationship) return;
    await apiRequest({
      request: () => UserRelationshipAPI.cancelFriendRequest(relationship.id),
      onError: handleError
    })
    function handleError(_error: unknown) {
      toast.error('Error sending friend request, please try again later!');
    }
  }

  async function handleAcceptFriendRequest() {
    if (!relationship) return;
    await apiRequest({
      request: () => UserRelationshipAPI.acceptFriendRequest(relationship),
      onError: handleError
    })
    function handleError(_error: unknown) {
      toast.error('Error accepting friend request, please try again later!');
    }
  }

  if (currentChatRoomInfo?.relationshipStatus === 'Friend') return;

  return (
    <div className={generateClassName(styles, ['relationship-container',
      ...currentChatRoomInfo?.relationshipStatus === 'RequestReceived' ? ['request-received'] : [],
      ...currentChatRoomInfo?.relationshipStatus === 'RequestSent' ? ['request-sent'] : [],
      ...currentChatRoomInfo?.relationshipStatus === 'NotFriend' ? ['not-friend'] : []

    ])}>
      {
        currentChatRoomInfo?.relationshipStatus === 'NotFriend' && <button onClick={handleSendFriendRequest}>
          <PersonAddIcon />
          Add friend
        </button>
      }
      {
        currentChatRoomInfo?.relationshipStatus === 'RequestReceived'
        && <>
          <Typography>Friend request</Typography>
          <Button variant="outlined" color="error" onClick={handleCancelFriendRequest}>
            Decline
          </Button>
          <Button variant="outlined" onClick={handleAcceptFriendRequest}>
            Accept
          </Button>
        </>
      }
      {
        currentChatRoomInfo?.relationshipStatus === 'RequestSent' && true && <>
          <Button variant="outlined" onClick={handleCancelFriendRequest}>
            Cancel friend request
          </Button>
        </>
      }
    </div>
  )

}
export default NavBarRelationship
type NavBarRelationshipProps = {
  relationship: UserRelationship | null;
  targetUser: User | null;
}