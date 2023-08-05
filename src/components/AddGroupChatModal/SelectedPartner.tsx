import { Typography } from '@mui/material';
import styles from '../../styles/SelectedUser.module.scss';
import { User } from '../../types/dataType';
import Avatar from '../Avatar';
import { X } from 'phosphor-react';
function SelectedPartner({ user, onClick }: SelectedPartnerProps) {
    return (
        <div className={styles['selected-user-container']}>
            <Avatar name={user.displayName} imgUrl={user.photoUrl} size={2} />
            <Typography>{user.displayName}</Typography>
            <button onClick={onClick}><X /></button>
        </div>
    )
}

export default SelectedPartner

type SelectedPartnerProps = {
    user: User,
    onClick: () => void
}