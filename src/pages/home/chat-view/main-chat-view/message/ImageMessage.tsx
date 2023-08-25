import { Message } from '@data-type'
import styles from '@styles/ImageMessage.module.scss';
import { isImageFromFileName } from '@helper/getFileExtensionImage';
import { useState } from 'react';
import errorImg from '@images/error-image.svg';
function ImageMessage({ message }: ImageMessageProps) {
    const [error, setError] = useState<React.SyntheticEvent<HTMLImageElement, Event> | null>(null);
    if (!isImageFromFileName(message.fileName)) return;
    return (
        <div className={styles['image-message-container']}>
            {
                error ? <div className={styles['error-image-container']}>
                    <img src={errorImg} className={styles['error-image']} />
                    <span>{message.fileName}</span>
                </div> : <a href={message.fileUrls} target='_blank'>
                    <img src={message.fileUrls} className={styles['image']} onError={e => setError(e)} />
                </a>
            }
        </div>
    )
}

export default ImageMessage
type ImageMessageProps = {
    message: Message & {
        type: 'Files',
        fileStatus: 'Done'
    }
}