import { getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { Message, UploadFileStatus, UploadTask as UploadTaskType } from '@data-type';
import { getChatRoomFileRef } from '../firebase/firebase-config';
import { MessageAPI } from '@api';

export function uploadFileTask(message: (Message & ({
    type: 'Files',
    fileStatus: 'InProgress',
} | {
    type: 'AudioRecord',
    fileStatus: 'InProgress',
})), onFinish?: () => void
): UploadTaskType {
    let observers: ((uploadStatus: UploadFileStatus) => void)[] = [];
    const storageRef = getChatRoomFileRef(message.chatRoomId, message.id);
    const uploadTask = message.type === 'Files' ? uploadBytesResumable(storageRef, message.files) : uploadBytesResumable(storageRef, message.audio,);
    let uploadStatus: UploadFileStatus = { progress: 0 };

    async function handleUpdateMessageOnFileUploadFinish(downloadUrl: string) {
        try {
            await MessageAPI.updateMessageOnFileUploadFinish(message.id, downloadUrl!);
        } catch (err) {
            console.error(err);
        }
    }

    uploadTask.on('state_changed', (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (prog === 100) {
            onFinish && onFinish();
        }
        uploadStatus = { ...uploadStatus, progress: prog }
        for (let observer of observers) {
            observer(uploadStatus);
        }
    },
        (error) => {
            uploadStatus = { ...uploadStatus, error: error }
            for (let observer of observers) {
                observer(uploadStatus);
            }
        },
        async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            handleUpdateMessageOnFileUploadFinish(downloadUrl);
        });

    const subscribe = (callback: (uploadStatus: UploadFileStatus) => void) => {
        observers.push(callback);
        return () => {
            observers = observers.filter(cb => cb !== callback)
        }
    }

    const cancelTask = () => { uploadTask.cancel() };
    return {
        messageId: message.id,
        cancelTask,
        subscribe,
        file: message.type === 'Files' ? message.files : message.audio
    }
}