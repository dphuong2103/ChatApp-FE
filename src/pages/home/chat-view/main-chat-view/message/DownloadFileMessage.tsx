import DownloadIcon from '@mui/icons-material/Download';
import styles from '@styles/DownloadFileMessage.module.scss';
import { Message } from '@data-type';
import { MessageAPI } from '@api';
import FileIcon from '../../../../../components/FileIcon';
import Skeleton from '@mui/material/Skeleton';
import { getExtensionFromName } from '@helper/getFileExtensionImage';
import ErrorMessageFile from './ErrorMessageFile';
import useFetchApi from '@hooks/useApi';

function DownloadFileMessage({ message }: DownloadFileMessageProps) {
    const { data: metaData, hasError, loading: isLoading } = useFetchApi({
        request: () => MessageAPI.getMessageFileMetaData(message.chatRoomId, message.id),
        dependencies: [message.chatRoomId, message.id]
    });

    if (hasError) {
        const errorMessage: Message & {
            type: 'Files',
            fileStatus: 'Error'
        } = { ...message, type: 'Files', fileStatus: 'Error' }
        return <ErrorMessageFile message={errorMessage} />
    }

    return (

        <div className={styles['download-file-message-container']} >
            {isLoading && <>
                <Skeleton variant="rounded" width={64} height={64} />
                <Skeleton variant="rounded" width={210} height={10} />
            </>
            }
            {
                !isLoading && <>
                    <FileIcon extension={getExtensionFromName(message.fileName)} />
                    <div className={styles['file-info']}>
                        <span className={styles['file-name']}>{message.fileName}</span>
                        <span className={styles['file-size']}>{metaData?.size && (metaData.size / 1048576).toFixed(2)} mb</span>
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

