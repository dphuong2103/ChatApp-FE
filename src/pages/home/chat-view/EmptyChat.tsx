import { Typography } from '@mui/material';
import styles from '../../../styles/EmptyChat.module.scss';

function EmptyChat() {
    return (
        <div className={styles['empty-chat-container']}>
            <Typography color='white' variant='h4' align='center'>Select a chat or search for new chat and let's tawk!</Typography>
        </div>
    )
}

export default EmptyChat