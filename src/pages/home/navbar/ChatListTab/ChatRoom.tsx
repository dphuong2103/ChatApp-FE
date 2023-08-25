import { Typography } from '@mui/material';
import styles from '@styles/ChatRoom.module.scss';
import { latestMessageTime } from '@helper/dateTime';
import { ChatRoomInfo, ChatRoomSummary } from '@data-type';
import { useEffect, useState } from 'react';
import { getChatRoomInfo } from '@helper/chatRoomHelper';
import { useAppSelector } from '../../../../redux/store';
import Avatar from '../../../../components/Avatar';
import { generateClassName } from '@helper/generateClassName';
function ChatRoom({ chatRoomSummary, onClick, isSelected }: ChatRoomProps) {
    const [chatNameAndPhoto, setChatNameAndPhoto] = useState<ChatRoomInfo>();
    const currentUserId = useAppSelector(state => state.auth.user?.id);
    const senderName = chatRoomSummary.latestMessage?.sender.id === currentUserId ? 'You' : chatRoomSummary.latestMessage?.sender.displayName;
    const lastMesesage = `${senderName ?? ''}: ${chatRoomSummary.latestMessage?.messageText}`;

    useEffect(() => {
        setChatNameAndPhoto(getChatRoomInfo(chatRoomSummary));
    }, [chatRoomSummary]);

    function handleOnClickChatRoom() {
        onClick(chatRoomSummary);
    }

    return (
        <div className={generateClassName(styles, ['chatroom-container', ...isSelected ? ['active'] : []])} onClick={handleOnClickChatRoom}>
            <Avatar name={chatNameAndPhoto?.name} imgUrl={chatNameAndPhoto?.imgUrl} />

            <div className={styles.info}>
                <Typography fontWeight={400} fontSize={'1rem'}>{chatNameAndPhoto?.name}</Typography>
                {!!chatRoomSummary.latestMessage && <Typography fontSize={'0.9rem'} className={styles['last-message']}>{lastMesesage}</Typography>}
            </div>
            {
                chatRoomSummary.latestMessage?.createdTime && <div className={styles['last-message-time']}>
                    <Typography component={'span'} fontSize='0.875rem'>
                        {latestMessageTime(chatRoomSummary.latestMessage.createdTime!)}
                    </Typography>
                    {
                        (!!chatRoomSummary.numberOfUnreadMessages && chatRoomSummary.numberOfUnreadMessages > 0) && <Typography component={'span'} className={styles['number-of-unread-messages']} fontSize='0.875rem'>
                            {`+${chatRoomSummary.numberOfUnreadMessages}`}
                        </Typography>
                    }
                </div>
            }
        </div>
    )
}

export default ChatRoom

type ChatRoomProps = {
    chatRoomSummary: ChatRoomSummary;
    onClick: (chatRoomSummary: ChatRoomSummary) => void;
    isSelected: boolean
}