import styles from '@styles/RepliedMessage.module.scss';
import { Typography } from '@mui/material';
import { generateClassName } from '@helper/generateClassName';
import { Message } from '@data-type';
import FileIcon from '../../../../../components/FileIcon';
import { useMemo } from 'react';
import { isImageFromFileName } from '@helper/getFileExtensionImage';
import { Microphone } from 'phosphor-react';


function RepliedMessage({ message }: ReplyMessageProps) {
    const repliedMessageText = useMemo(() => truncateMessageName(message), [message.messageText]);
    return (
        <div className={generateClassName(styles, ['replied-message-container', ...message ? [] : ['d-none']])}>
            <Typography component='span' variant='body2' fontWeight={500}>{message.sender.displayName}</Typography>
            {
                message.type === 'AudioRecord' && message.fileStatus === 'Done' && <div className={styles['audio-message-container']}>
                    <Microphone size={23} />
                    <span>Audio message</span>
                </div>
            }
            {
                (message.type === 'Files' && message.fileName && message.fileStatus === 'Done') && <>
                    {
                        isImageFromFileName(message.fileName) ? <img src={message.fileUrls} className={styles.image} /> :
                            < FileIcon extension={message.fileName.split('.').pop() ?? ''} style={{ width: '2.5rem', height: '2.5rem' }} />
                    }
                </>
            }
            {
                message.type === 'PlainText' && <div className={styles['replied-message']}>{repliedMessageText}</div>
            }
        </div >
    )
}

export default RepliedMessage

type ReplyMessageProps = {
    message: Message
}
function truncateMessageName(message: Message) {
    return (message?.messageText && message.messageText?.length >= 100) ? `${message.messageText.substring(0, 100)}...` : message.messageText;
}
