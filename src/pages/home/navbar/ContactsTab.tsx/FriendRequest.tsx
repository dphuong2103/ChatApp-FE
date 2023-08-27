import { Typography } from '@mui/material';
import Avatar from '../../../../components/Avatar';
import styles from '@styles/FriendRequest.module.scss'
import { UserRelationship } from '@data-type';
import { generateClassName } from '@helper/generateClassName';
import { UserRelationshipAPI } from '@api';
import { apiRequest } from '@hooks/useApi';
function FriendRequest({ friendRequest, type }: FriendRequestProps) {
    if (type === 'unknown') return;
    if (type === 'receive' && !friendRequest.initiatorUser) return;
    if (type === 'request' && !friendRequest.targetUser) return;

    async function handleAcceptFriendRequest() {
        if (!friendRequest) return;
        try {
            await UserRelationshipAPI.acceptFriendRequest(friendRequest);
        } catch (err) {
            console.error(err);
        }
    }

    async function handleCancelFriendRequest() {
        if (!friendRequest) return;
        await apiRequest({ request: () => UserRelationshipAPI.cancelFriendRequest(friendRequest.id) })
    }
    return <div className={styles['friend-request-container']}>
        <div className={styles['card']}>
            {
                type === 'receive' && <div className={styles['initiator-info-container']}>
                    <Avatar name={friendRequest.initiatorUser!.displayName} imgUrl={friendRequest.initiatorUser!.photoUrl} />
                    <Typography variant='body1' fontWeight={500}>{friendRequest.initiatorUser!.displayName}</Typography>
                </div>

            }
            {
                type === 'request' && <div className={styles['initiator-info-container']}>
                    <Avatar name={friendRequest.targetUser!.displayName} imgUrl={friendRequest.targetUser!.photoUrl} />
                    <Typography variant='body1' fontWeight={500}>{friendRequest.targetUser!.displayName}</Typography>
                </div>
            }

            <div className={generateClassName(styles, ['actions-container', ...type === 'request' ? ['request'] : ['receive']])}>
                {
                    type === 'receive' && <>
                        <button className={generateClassName(styles, ['btn', 'decline'])} onClick={handleCancelFriendRequest}><Typography>Decline</Typography></button>
                        <button className={generateClassName(styles, ['btn', 'accept'])} onClick={handleAcceptFriendRequest}><Typography>Accept</Typography></button></>
                }
                {
                    type === 'request' && <button className={generateClassName(styles, ['btn', 'cancel'])} onClick={handleCancelFriendRequest}><Typography>Cancel</Typography></button>
                }
            </div>
        </div>

    </div >
}

export default FriendRequest;

type FriendRequestProps = {
    friendRequest: UserRelationship,
    type: 'request' | 'receive' | 'unknown'
}