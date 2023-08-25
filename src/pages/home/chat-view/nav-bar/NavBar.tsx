import { IconButton, Typography } from '@mui/material'
import { ArrowLeft, DotsThreeVertical, Phone, VideoCamera } from 'phosphor-react'
import styles from '../../../../styles/ChatNavBar.module.scss'
import { useCallContext, useChatContext, useCurrentChatRoomContext } from '@helper/getContext'
import { useState } from 'react';
import Avatar from '../../../../components/Avatar';
import { CallType } from '@data-type';
import NavBarRelationship from './NavBarRelationship';
import UserInfoModal from '../../../../components/UserInfoModal';

function NavBar() {
    const { setShowChatRoom, currentChatRoomSummary, currentChatRoomInfo, newChat, } = useCurrentChatRoomContext();
    const { handleCall } = useCallContext();
    const [openUserInfoModal, setOpenUserInfoModal] = useState(false);
    const { setShowChatInfo } = useChatContext();

    function handleBackClick() {
        setShowChatRoom(false);
    }

    function handleClickAvatar() {
        if (currentChatRoomSummary?.chatRoom.chatRoomType === 'ONE') {
            setOpenUserInfoModal(true)
        }
        else return undefined;
    }

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
                (currentChatRoomSummary?.chatRoom.chatRoomType === 'ONE' || !!newChat) &&
                <NavBarRelationship relationship={currentChatRoomInfo?.relationship ?? null} targetUser={currentChatRoomInfo?.partners[0] ?? null} />
            }
            <UserInfoModal
                open={openUserInfoModal}
                userId={currentChatRoomInfo?.partners[0]?.id}
                relationship={currentChatRoomInfo?.relationship}
                onClose={() => setOpenUserInfoModal(false)} />
        </header >
    )
}

export default NavBar