import DownloadIcon from '@mui/icons-material/Download';
import styles from '../../../styles/DownloadFileMessage.module.scss';
import { Message } from '../../../types/dataType';
import { FullMetadata } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { MessageAPI } from '../../../api';
import FileIcon from '../../../components/FileIcon';
import Skeleton from '@mui/material/Skeleton';
import { getExtensionFromName, isImageFromFileName } from '../../../helper/getFileExtensionImage';

function DownloadFileMessage({ message }: DownloadFileMessageProps) {
    if (isImageFromFileName(message.fileName)) return;
    const [metaData, setMetaData] = useState<FullMetadata | null>(null)
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        getMetaData();

        async function getMetaData() {
            if (message.fileUrls) {
                setIsLoading(true)
                try {
                    var metaData = await MessageAPI.getMessageFileMetaData(message.chatRoomId, message.id);
                    setMetaData(metaData);
                } catch (err) {
                    console.error('Error getting metadata: ', err);
                } finally {
                    setIsLoading(false);
                }
            }
        }
    }, [])

    return (
        <div className={styles['download-file-message-container']}>
            {isLoading && <>
                <Skeleton variant="rounded" width={64} height={64} />
                <Skeleton variant="rounded" width={210} height={10} />
            </>
            }
            {
                metaData && !isLoading && <>
                    <FileIcon extension={getExtensionFromName(message.fileName)} />
                    <div className={styles['file-info']}>
                        <span className={styles['file-name']}>{message.fileName}</span>
                        <span className={styles['file-size']}>{metaData.size && (metaData.size / 1048576).toFixed(2)} mb</span>
                    </div>
                    <a className={styles['btn']} href={message.fileUrls} target='_blank'><DownloadIcon /></a>
                </>
            }
        </div>
    )
}

export default DownloadFileMessage
type DownloadFileMessageProps = {
    message: Message & {
        type: 'Files',
        fileStatus: 'Done'
    }
}