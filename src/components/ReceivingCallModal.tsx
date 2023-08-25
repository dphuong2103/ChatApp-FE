import { IconButton, Modal, Typography } from '@mui/material'
import { ChatRoomInfo } from '@data-type'
import styles from '../styles/CallingModal.module.scss';
import Avatar from './Avatar';
import answerCallIcon from '../assets/imgs/answercallicon.svg';
import declineCallIcon from '../assets/imgs/declinecallicon.svg'
function ReceivingCallModal({ open, handleAcceptCallClick, handleDeclineCallClick }: CallingProps) {
    return (
        <Modal open={open} className={styles['modal-backdrop']}>
            <div className={styles['calling-modal-container']}>
                <Avatar name={'Phuong'} />
                <Typography variant='h5' color='white'>Phuong</Typography>
                <Typography variant='body2' color='white'>Audio Call</Typography>
                <div className={styles['actions-container']}>
                    <IconButton className={styles.action} onClick={handleAcceptCallClick}>
                        <img src={answerCallIcon} />
                    </IconButton>
                    <IconButton className={styles.action} onClick={handleDeclineCallClick}>
                        <img src={declineCallIcon} />
                    </IconButton>
                </div>
            </div>
        </Modal>
    )
}

export default ReceivingCallModal

type CallingProps = {
    open: boolean,
    chatRoomInfo?: ChatRoomInfo,
    handleAcceptCallClick: () => void,
    handleDeclineCallClick: () => void
}