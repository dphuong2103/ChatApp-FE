import { ChatRoomType, NewChatRoomAndUserList, User, UserRelationship } from '@data-type'
import { useAppSelector } from '../../../../redux/store';
import { generateClassName } from '@helper/generateClassName';
import styles from '@styles/NavBarRelationship.module.scss';
import { Typography, Button } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { ChatRoomAPI, UserRelationshipAPI } from '@api';
import { useCurrentChatRoomContext } from '@helper/getContext';
function NavBarRelationship({ relationship, targetUser }: NavBarRelationshipProps) {
  const { newChat, handleSetCurrentChatRoomSummary, currentChatRoomInfo } = useCurrentChatRoomContext();
  const currentUser = useAppSelector(state => state.auth.user);

  async function handleSendFriendRequest() {
    if (!currentUser || !targetUser?.id) return;
    if (newChat) {
      await handleCreateChatRoom();
      return;
    }
    try {
      await UserRelationshipAPI.sendFriendRequest(currentUser.id, targetUser.id);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateChatRoom() {
    try {
      const newChatRoomAndUserList: NewChatRoomAndUserList = {
        newChatRoom: {
          chatRoomType: ChatRoomType.ONE,
          creatorId: currentUser!.id
        },
        userIds: [currentUser!.id, targetUser!.id]
      }
      var response = await ChatRoomAPI.addNewChatRoom(newChatRoomAndUserList);
      const newChatRoomSummary = response.data;
      handleSetCurrentChatRoomSummary(newChatRoomSummary)
      await UserRelationshipAPI.sendFriendRequest(currentUser!.id, targetUser!.id);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCancelFriendRequest() {
    if (!relationship) return;
    try {
      await UserRelationshipAPI.cancelFriendRequest(relationship.id);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAcceptFriendRequest() {
    if (!relationship) return;
    try {
      await UserRelationshipAPI.acceptFriendRequest(relationship);
    } catch (err) {
      console.error(err);
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