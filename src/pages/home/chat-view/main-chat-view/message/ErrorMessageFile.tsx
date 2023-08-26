import errorFile from '@images/error-file.svg';
import { Typography } from '@mui/material';
import styles from '@styles/ErrorMessageFile.module.scss';
import { MicrophoneSlash } from 'phosphor-react';
import { Message } from '@data-type';
function ErrorMessageFile({ message }: ErrorMessageFile) {
    return (
        <div className={styles['error-message-file-container']}>
            {
                message.type === 'AudioRecord' ? <MicrophoneSlash size={30} /> : <img src={errorFile} className={styles.image} />
            }
            <div className={styles['text-container']}>
                <span className={styles['file-name']}>{message.fileName}</span>
                <Typography variant='body2'>
                    {
                        message.type === 'AudioRecord' ? ' Error audio!' : 'Error file!'
                    }
                </Typography>
            </div>

        </div >
    )
}

export default ErrorMessageFile
type ErrorMessageFile = {
    message: Message & {
        type: 'AudioRecord' | 'Files',
        fileStatus: 'Error',
    }
}