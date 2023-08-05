import { Button, IconButton, Modal, Typography } from '@mui/material';
import styles from '../styles/UserInfoModal.module.scss';
import Avatar from './Avatar';
import { RelationshipStatus, User, UserRelationship } from '../types/dataType';
import { generateClassName } from '../utils/generateClassName';
import { useEffect, useState } from 'react';
import { getRelationshipStatus } from '../helper/relationshipHelper';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { UserRelationshipAPI } from '../api';
import { useAppSelector } from '../redux/store';
import { X } from 'phosphor-react';
import { useChatRoomSummaryContext, useCurrentChatRoomContext } from '../helper/getContext';
import { getChatRoomAndUserListByUserIdFromChatRoomSummaries } from '../helper/chatRoomHelper';
import { formatDateFromString } from '../helper/dateTime';

function UserInfoModal({ open, user, relationship, onClose }: UserInfoModalProps) {
    const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus | null>(null)
    const { chatRoomSummaries } = useChatRoomSummaryContext();
    const { handleSetCurrentChatRoomSummary } = useCurrentChatRoomContext();
    const currentUser = useAppSelector(state => state.auth.user);
    useEffect(() => {
        setRelationshipStatus(getRelationshipStatus(relationship))
    }, [relationship])

    async function handleSendFriendRequest() {
        if (!currentUser || !user!.id) return;
        try {
            await UserRelationshipAPI.sendFriendRequest(currentUser.id, user!.id);
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


    function handleSendMessageClick() {
        const chatRoomAndUserList = getChatRoomAndUserListByUserIdFromChatRoomSummaries(user!.id, chatRoomSummaries);
        if (!chatRoomAndUserList) {
            console.error('Cannot find chatroom');
            return;
        }
        handleSetCurrentChatRoomSummary(chatRoomAndUserList);
        onClose();
    }

    return <Modal open={open} className={styles['user-info-modal-backdrop']} onClose={onClose}>
        <div className={styles['container']}>
            <div className={styles['title-container']}>
                <Typography variant='h6' >Account information</Typography>
                <IconButton onClick={() => onClose()}>
                    <X />
                </IconButton>
            </div>
            <section className={styles['general-info-container']}>
                <Avatar name={user?.displayName} imgUrl={user?.photoUrl} size={5} />
                <Typography variant='h6'>{user?.displayName}</Typography>
                {
                    relationshipStatus === 'RequestReceived'
                    && <div className={styles['actions-request-received-container']}>
                        <Button variant="outlined" color="error" onClick={handleCancelFriendRequest} fullWidth>
                            Decline
                        </Button>
                        <Button variant="outlined" onClick={handleAcceptFriendRequest} fullWidth>
                            Accept
                        </Button>
                    </div>
                }
                <div className={styles['friendship-actions']}>
                    {
                        relationshipStatus === 'NotFriend' && <button onClick={handleSendFriendRequest} className={generateClassName(styles, ['btn'])}>
                            <PersonAddIcon />
                            Add friend
                        </button>
                    }

                    {
                        relationshipStatus === 'RequestSent' && true && <>
                            <button onClick={handleCancelFriendRequest} className={generateClassName(styles, ['btn'])}>
                                Cancel friend request
                            </button>
                        </>
                    }

                    <button className={generateClassName(styles, ['btn'])} onClick={handleSendMessageClick}>
                        Send message
                    </button>
                </div>
            </section>

            <section className={styles['personal-info-container']}>
                <span className={styles.title}>
                    Personal information
                </span>
                <div className={styles['personal-info']}>
                    <div className={styles['info-container']}>
                        <div className={styles['info-title']}>Gender: </div>
                        <div>Male</div>
                    </div>
                    <div className={styles['info-container']}>
                        <div className={styles['info-title']}>Date of birth: </div>
                        <div>{formatDateFromString(user?.dateOfBirth)}</div>
                    </div>
                    <div className={styles['info-container']}>
                        <div className={styles['info-title']}>Bio: </div>
                        <span className={generateClassName(styles, ['bio'])}>{user?.bio}</span>
                    </div>
                </div>
            </section>

        </div>
    </Modal>
}
export default UserInfoModal;

type UserInfoModalProps = {
    open: boolean,
    user?: User,
    relationship?: UserRelationship,
    onClose: () => void,
}