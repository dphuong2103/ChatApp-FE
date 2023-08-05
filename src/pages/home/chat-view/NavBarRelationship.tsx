import { useEffect, useState } from 'react'
import { RelationshipStatus, User, UserRelationship } from '../../../types/dataType'
import { useAppSelector } from '../../../redux/store';
import { generateClassName } from '../../../utils/generateClassName';
import styles from '../../../styles/NavBarRelationship.module.scss';
import { Typography, Button } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { UserRelationshipAPI } from '../../../api';
import { getRelationshipStatus } from '../../../helper/relationshipHelper';
function NavBarRelationship({ relationship, targetUser }: NavBarRelationshipProps) {
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus | null>(null);
  const currentUser = useAppSelector(state => state.auth.user);

  useEffect(() => {
    setRelationshipStatus(getRelationshipStatus(relationship));
  }, [relationship])
  
  async function handleSendFriendRequest() {
    if (!currentUser || !targetUser?.id) return;
    try {
      await UserRelationshipAPI.sendFriendRequest(currentUser.id, targetUser.id);
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