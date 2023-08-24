import { Button, Dialog, DialogActions, DialogTitle, IconButton, ListItemIcon, ListItemText, MenuItem, MenuList, Modal, Typography } from '@mui/material';
import styles from '../styles/UserInfoModal.module.scss';
import Avatar from './Avatar';
import { ChatRoomSummaryActionType, User, UserRelationship } from '../types/dataType';
import { generateClassName } from '../utils/generateClassName';
import { useEffect, useState } from 'react';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { UserAPI, UserRelationshipAPI } from '../api';
import { useAppSelector } from '../redux/store';
import { X } from 'phosphor-react';
import { useChatRoomSummaryContext, useCurrentChatRoomContext } from '../helper/getContext';
import { getChatRoomAndUserListByUserIdFromChatRoomSummaries } from '../helper/chatRoomHelper';
import { formatDateFromString } from '../helper/dateTime';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import { toast } from 'react-toastify';
function UserInfoModal({ open, userId, relationship, onClose }: UserInfoModalProps) {
    const { chatRoomSummaries, dispatchChatRoomSummary } = useChatRoomSummaryContext();
    const { handleSetCurrentChatRoomSummary, currentChatRoomInfo } = useCurrentChatRoomContext();
    const currentUser = useAppSelector(state => state.auth.user);
    const [user, setUser] = useState<User | null>(null);
    const [openDeleteFriendDialog, setOpenDeleteFriendDialog] = useState(false);
    useEffect(() => {
        getUser();

        async function getUser() {
            if (userId && open) {
                try {
                    var user = (await UserAPI.getUserById(userId)).data;
                    setUser(user)
                    dispatchChatRoomSummary({ type: ChatRoomSummaryActionType.UpdateUser, payload: user })
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }, [userId, open])


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
    async function handleDeleteFriend() {
        if (!currentChatRoomInfo?.relationship) return;
        try {
            await UserRelationshipAPI.cancelFriendRequest(currentChatRoomInfo.relationship.id);
            setOpenDeleteFriendDialog(false);
            toast.info('Friend deleted successfully');
        } catch (err) {
            toast.error('Cannot delete friend, please try again later!');
            console.error(err)
        }
    }

    return <Modal open={open} className={styles['user-info-modal-backdrop']} onClose={onClose}>
        <div className={styles['container']}>
            <section className={styles['title-container']}>
                <Typography variant='h6' >Account information</Typography>
                <IconButton onClick={() => onClose()}>
                    <X />
                </IconButton>
            </section>
            <section className={styles['general-info-container']}>
                <Avatar name={user?.displayName} imgUrl={user?.photoUrl} size={5} />
                <Typography variant='h6'>{user?.displayName}</Typography>
                {
                    currentChatRoomInfo?.relationshipStatus === 'RequestReceived'
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
                        currentChatRoomInfo?.relationshipStatus === 'NotFriend' && <button onClick={handleSendFriendRequest} className={generateClassName(styles, ['btn'])}>
                            <PersonAddIcon />
                            Add friend
                        </button>
                    }

                    {
                        currentChatRoomInfo?.relationshipStatus === 'RequestSent' && true && <>
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

            <section className={styles['personal-info-wrapper']}>
                <div className={styles['personal-info-container']}>
                    <span className={styles.title}>
                        Personal information
                    </span>
                    <div className={styles['personal-info']}>
                        <div className={styles['info-container']}>
                            <div className={styles['info-title']}>Gender: </div>
                            <div>{user?.gender}</div>
                        </div>
                        <div className={styles['info-container']}>
                            <div className={styles['info-title']}>Email: </div>
                            <div>{user?.email}</div>
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
                </div>

            </section>
            <MenuList style={{ paddingTop: '1rem' }}>
                {
                    currentChatRoomInfo?.relationshipStatus === 'Friend' && <MenuItem style={{ borderRadius: '5px', color: 'red' }} onClick={() => setOpenDeleteFriendDialog(true)}>
                        <ListItemIcon >
                            <PersonOffIcon fontSize="small" style={{ color: 'red' }} />
                        </ListItemIcon>
                        <ListItemText>Remove friend</ListItemText>
                    </MenuItem>
                }

            </MenuList>
            <Dialog
                open={openDeleteFriendDialog}
                onClose={() => setOpenDeleteFriendDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Are you sure you want to delete this friend?"}
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteFriendDialog(false)}>Cancel</Button>
                    <Button onClick={handleDeleteFriend} autoFocus color='error' >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    </Modal >
}
export default UserInfoModal;

type UserInfoModalProps = {
    open: boolean,
    userId?: string,
    relationship?: UserRelationship,
    onClose: () => void,
}