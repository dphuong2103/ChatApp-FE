import { Typography } from '@mui/material';
import { Message as TypeMessage } from '@data-type';
import styles from '@styles/Message.module.scss';
import { useAppSelector } from '../../../../../redux/store';
import { generateClassName } from '@helper/generateClassName';
import { messageTime } from '@helper/dateTime';
import Avatar from '../../../../../components/Avatar';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useState } from 'react';
import { toast } from 'react-toastify';
import MessageActionMenu from './MessageActionMenu';
import { MessageAPI } from '@api';
import { useChatContext } from '@helper/getContext';
import MessageFile from './MessageFile';
import { getChatRoomFileRef } from '../../../../../firebase/firebase-config';
import { deleteObject } from 'firebase/storage';
import RepliedMessage from './RepliedMessage';

function Message({ message, onAvatarClick }: MessageProps) {
    const [messageMenuAnchorEl, setMessageMenuAnchorEl] = useState<HTMLElement | null>(null);
    const currentUserId = useAppSelector(state => state.auth.user?.id);
    const { handleSetReplyToMessage } = useChatContext();

    function handleMenuClick(e: React.MouseEvent<HTMLElement>) {
        setMessageMenuAnchorEl(e.currentTarget);
    }

    function handleOnCloseMessageMenu() {
        setMessageMenuAnchorEl(null);
    }

    async function hanldeCopyToClipBoard() {
        try {
            await navigator.clipboard.writeText(message.messageText);
        } catch (err) {
            toast.error('Cannot copy, please copy manually');
            console.error(err);
        }
    }

    async function handleDeleteMessage() {
        if (message.senderId !== currentUserId) {
            toast.info('You cannot delete message which is not yours!');
            return;
        }
        if (message.type === 'Files' || message.type === 'AudioRecord') {
            try {
                const fileRef = getChatRoomFileRef(message.chatRoomId, message.id);
                await deleteObject(fileRef);
            } catch (err) {
                console.error('Cannot delete file in firebase')
            }
        }

        try {
            await MessageAPI.setDeleteMessage(message.id);
            toast.success('Message deleted!');
        } catch (err) {
            toast.error('Error deleting message, please try again')
            console.error(err);
        }

    }

    return (
        <div className={generateClassName(styles, ['message-container', ...message.senderId === currentUserId ? ['right'] : []])}>
            <div className={generateClassName(styles, ['message-card', ...message.senderId === currentUserId ? ['right'] : []])}>
                {
                    message.senderId !== currentUserId && <Avatar name={message.sender.displayName} imgUrl={message.sender.photoUrl} onClick={onAvatarClick} />
                }
                <div className={styles['message-info']}>
                    {
                        (message.type === 'Files' || message.type === 'AudioRecord') && <MessageFile message={message} />
                    }
                    {message.replyToMessage && <RepliedMessage message={message.replyToMessage} />}
                    <Typography color='black' >{message.messageText}</Typography>
                    <span className={styles.time}>{messageTime(message.createdTime)}</span>
                </div>
            </div>

            <div className={styles['message-actions-container']}>
                <button className={styles.action} onClick={() => handleSetReplyToMessage(message)}>
                    <FormatQuoteIcon />
                </button>
                <button className={styles.action} onClick={handleMenuClick} >
                    <MoreHorizIcon />
                </button>
            </div>

            <MessageActionMenu anchorEl={messageMenuAnchorEl} onClose={handleOnCloseMessageMenu} copy={hanldeCopyToClipBoard} deleteMessage={handleDeleteMessage} />

        </div>
    )
}

export default Message

type MessageProps = {
    message: TypeMessage,
    onAvatarClick?: () => void
}


