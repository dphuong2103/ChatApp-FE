import { useEffect, useState } from 'react';
import { chatRoomFileRef } from '../../../firebase-config';
import { useUploadFiles } from '../../../hooks/useUploadFile'
import { Message, MessagesActionType } from '../../../types/dataType'
import { MessageAPI } from '../../../api';
import styles from '../../../styles/UploadFileMessage.module.scss';
import LinearProgressWithLabel from '../../../components/LinearProgressWithLabel';
import FileIcon from '../../../components/FileIcon';
import { X } from 'phosphor-react';
import { useCurrentChatRoomContext } from '../../../helper/getContext';
import { getExtensionFromName } from '../../../helper/getFileExtensionImage';

function UploadFileMessage({ message }: UploadFileMessageType) {
    if (message.type !== 'Files' || message.fileStatus !== 'InProgress') return;
    const useUploadFile = useUploadFiles(chatRoomFileRef(message.chatRoomId, message.id), message.files || null);
    const { dispatchMessage } = useCurrentChatRoomContext();
    useEffect(() => {
        if (useUploadFile?.downloadUrl && !useUploadFile.error && useUploadFile?.progress === 100) {
            handleUpdateMessageOnFileUploadFinish()
        }
        async function handleUpdateMessageOnFileUploadFinish() {
            try {
                await MessageAPI.updateMessageOnFileUploadFinish(message.id, useUploadFile!.downloadUrl!);
            } catch (err) {
                console.error(err);
            }
        }

    }, [useUploadFile])

    async function handleCancel() {
        useUploadFile?.uploadRef?.current?.cancel();
        try {
            await MessageAPI.cancelUploadingMessageFile(message.id);
            dispatchMessage({ type: MessagesActionType.CancelUploadingMessageFile, payload: message.id })
        } catch (err) {
            console.log(err);
        }
    }


    return (
        <div className={styles['upload-file-message-container']}>
            <FileIcon extension={getExtensionFromName(message.fileName)} />
            <div className={styles['upload-info']}>
                <span className={styles['file-name']}>{message.files?.name}</span>
                <div className={styles['upload-status']}>
                    <LinearProgressWithLabel value={useUploadFile?.progress ?? 0} />
                    <button className={styles['btn']} onClick={handleCancel}>
                        <X fontSize={500} />
                    </button>
                </div>
            </div>

        </div >
    )
}

export default UploadFileMessage
type UploadFileMessageType = {
    message: Message
}