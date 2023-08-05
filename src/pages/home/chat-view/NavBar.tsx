import { IconButton, Typography } from '@mui/material'
import { ArrowLeft, DotsThreeVertical, Phone, VideoCamera } from 'phosphor-react'
import styles from '../../../styles/ChatNavBar.module.scss'
import { useCallContext, useChatContext, useChatRoomSummaryContext, useCurrentChatRoomContext } from '../../../helper/getContext'
import { useEffect, useState } from 'react';
import Avatar from '../../../components/Avatar';
import { CallType, User, UserRelationship } from '../../../types/dataType';
import { useAppSelector } from '../../../redux/store';
import { getRelationship } from '../../../helper/relationshipHelper';
import NavBarRelationship from './NavBarRelationship';
import UserInfoModal from '../../../components/UserInfoModal';

function NavBar() {
    const { setShowChatRoom, currentChatRoomSummary, currentChatRoomInfo, newChat } = useCurrentChatRoomContext();
    const { relationships } = useChatRoomSummaryContext();
    const [relationship, setRelationship] = useState<UserRelationship | null>(null);
    const [targetUser, setTargetUser] = useState<User | null>(null);
    const { handleCall } = useCallContext();
    const currentUser = useAppSelector(state => state.auth.user);
    const [openUserInfoModal, setOpenUserInfoModal] = useState(false);
    const { setShowChatInfo } = useChatContext();
    function handleBackClick() {
        setShowChatRoom(false);
    }

    function handleClickAvatar() {
        if (currentChatRoomSummary?.chatRoom.chatRoomType === 'ONE') {
            setOpenUserInfoModal(true)
        }
    }

    useEffect(() => {
        if (newChat) {
            setRelationship(null);
            setTargetUser(newChat.users[0])
        }
        if (currentChatRoomSummary) {
            currentChatRoomSummary.users.forEach(user => {
                if (user.id !== currentUser?.id) {
                    setTargetUser(user);
                }
            })
        }
    }, [currentChatRoomSummary, newChat]);

    useEffect(() => {
        if (relationships.length === 0) {
            setRelationship(null);
            return;
        }
        if (currentChatRoomSummary?.chatRoom.chatRoomType === 'ONE' && currentUser) {
            const chatWithUser = currentChatRoomSummary.users.find(u => u.id !== currentUser.id);
            if (chatWithUser) {
                const relationship = getRelationship(currentUser.id, chatWithUser.id, relationships);
                setRelationship(relationship);
            }
        }
    }, [currentChatRoomSummary, relationships, targetUser])

    return (
        <header className={styles['chat-navbar-container']}>
            <div className={styles['main']}>
                <IconButton onClick={handleBackClick} className={styles['btn-back']}>
                    <ArrowLeft />
                </IconButton>
                <div className={styles.info}>
                    <Avatar name={currentChatRoomInfo?.name} imgUrl={currentChatRoomInfo?.imgUrl} onClick={handleClickAvatar} />
                    <Typography fontWeight='bold'>{currentChatRoomInfo?.name}</Typography>
                </div>
                <div className={styles['action-container']}>
                    <IconButton onClick={() => handleCall(CallType.AUDIOCALL, currentChatRoomSummary)}>
                        <Phone />
                    </IconButton>
                    <IconButton onClick={() => handleCall(CallType.VIDEOCALL, currentChatRoomSummary)}>
                        <VideoCamera />
                    </IconButton>
                </div>

                <IconButton className={styles['menu']} onClick={() => setShowChatInfo(prev => !prev)}>
                    <DotsThreeVertical />
                </IconButton>
            </div>
            {
                (currentChatRoomSummary?.chatRoom.chatRoomType === 'ONE' || !!newChat) && <NavBarRelationship relationship={relationship} targetUser={targetUser} />
            }
            <UserInfoModal open={openUserInfoModal} user={targetUser ? targetUser : undefined} relationship={relationship ? relationship : undefined} onClose={() => setOpenUserInfoModal(false)} />
        </header >
    )
}

export default NavBar