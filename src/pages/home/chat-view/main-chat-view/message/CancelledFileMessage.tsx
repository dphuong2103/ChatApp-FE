import FileIcon from '../../../../../components/FileIcon';
import { getExtensionFromName } from '@helper/getFileExtensionImage';
import styles from '@styles/CancelledFileMessage.module.scss';
import { Message } from '@data-type';
function CancelledFileMessage({ message }: CancelledFileMessageProps) {
    if (message.type !== 'Files' || message.fileStatus !== 'Cancelled') return;
    return (
        <div className={styles['cancelled-file-message-container']}>
            <FileIcon extension={getExtensionFromName(message.fileName)} />
            <div className={styles['file-info']}>
                <span className={styles['file-name']}>{message.fileName}</span>
                <span className={styles['cancelled']}>Cancelled</span>
            </div>
        </div>
    )
}

export default CancelledFileMessage
type CancelledFileMessageProps = {
    message: Message & {
        type: 'Files',
        fileStatus: 'Cancelled'
    }
}