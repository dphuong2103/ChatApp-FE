import { useEffect, useState } from 'react';
import { Message, MessagesActionType, UploadFileStatus } from '@data-type'
import styles from '@styles/UploadFileMessage.module.scss';
import LinearProgressWithLabel from '../../../../../components/LinearProgressWithLabel';
import FileIcon from '../../../../../components/FileIcon';
import { X } from 'phosphor-react';
import { getExtensionFromName, isImageFromFileName } from '@helper/getFileExtensionImage';
import { MessageAPI } from '@api';
import { useCurrentChatRoomContext } from '@helper/getContext';
import { apiRequest } from '@hooks/useApi';

function UploadFileMessage({ message }: UploadFileMessageType) {
    const [uploadFileStatus, setUploadFile] = useState<UploadFileStatus | null>(null);
    const { dispatchMessage } = useCurrentChatRoomContext();
    useEffect(() => {
        let unsubscribe: () => void;
        if (message.uploadTask) {
            unsubscribe = message.uploadTask.subscribe((uploadFileStatus) => {
                setUploadFile(uploadFileStatus)
            })
        }
        return () => {
            unsubscribe();
        }
    }, [message.uploadTask])

    async function handleCancelUpload() {
        if (!message.uploadTask) return;
        await apiRequest({ request: () => MessageAPI.cancelUploadingMessageFile(message.id) })
        dispatchMessage({ type: MessagesActionType.CancelUploadingMessageFile, payload: message.id });
    }

    return (
        <div className={styles['upload-file-message-container']}>
            {
                (isImageFromFileName(message.fileName) && message.uploadTask) ? <img src={URL.createObjectURL(message.uploadTask.file)} style={{ maxWidth: '4rem', maxHeight: '4rem' }} /> : <FileIcon extension={getExtensionFromName(message.fileName)} />
            }
            <div className={styles['upload-info']}>
                <span className={styles['file-name']}>{message.fileName}</span>
                <div className={styles['upload-status']}>
                    <LinearProgressWithLabel value={uploadFileStatus?.progress ?? 0} />
                    <button className={styles['btn']} onClick={handleCancelUpload}>
                        <X fontSize={500} />
                    </button>
                </div>
            </div>
        </div >
    )
}

export default UploadFileMessage
type UploadFileMessageType = {
    message: Message & {
        type: 'Files',
        fileStatus: 'InProgress'
    }
}
