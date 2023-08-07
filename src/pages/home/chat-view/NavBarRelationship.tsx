import { useEffect, useState } from 'react'
import { ChatRoomType, NewChatRoomAndUserList, RelationshipStatus, User, UserRelationship } from '../../../types/dataType'
import { useAppSelector } from '../../../redux/store';
import { generateClassName } from '../../../utils/generateClassName';
import styles from '../../../styles/NavBarRelationship.module.scss';
import { Typography, Button } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { ChatRoomAPI, UserRelationshipAPI } from '../../../api';
import { getRelationshipStatus } from '../../../helper/relationshipHelper';
import { useCurrentChatRoomContext } from '../../../helper/getContext';
function NavBarRelationship({ relationship, targetUser }: NavBarRelationshipProps) {
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus | null>(null);
  const { newChat, handleSetCurrentChatRoomSummary } = useCurrentChatRoomContext();
  const currentUser = useAppSelector(state => state.auth.user);

  useEffect(() => {
    setRelationshipStatus(getRelationshipStatus(relationship));
  }, [relationship])

  async function handleSendFriendRequest() {
    console.log(newChat, targetUser?.id)
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
    console.log('click')
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

  if (relationshipStatus === 'Friend') return;

  return (
    <div className={generateClassName(styles, ['relationship-container',
      ...relationshipStatus === 'RequestReceived' ? ['request-received'] : [],
      ...relationshipStatus === 'RequestSent' ? ['request-sent'] : [],
      ...relationshipStatus === 'NotFriend' ? ['not-friend'] : []

    ])}>
      {
        relationshipStatus === 'NotFriend' && <button onClick={handleSendFriendRequest}>
          <PersonAddIcon />
          Add friend
        </button>
      }
      {
        // relationship?.relationshipType === 'E_FRIEND' && relationship.status === 'E_PENDING'
        relationshipStatus === 'RequestReceived'
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
        relationshipStatus === 'RequestSent' && true && <>
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