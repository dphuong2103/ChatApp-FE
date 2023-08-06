import { Typography } from '@mui/material';
import Avatar from '../../../../components/Avatar';
import styles from '../../../../styles/Friend.module.scss';
import { Friend as TypeFriend, Friend } from '../../../../types/dataType';

function Friend({ friend, onClick }: ContactProps) {

    async function handleUserClick() {
        onClick(friend);
    }
    return <div className={styles['friend-container']} onClick={handleUserClick}>
        <Avatar name={friend.user.displayName} imgUrl={friend.user.photoUrl} />
        <Typography variant='body1' fontWeight={500}>{friend.user.displayName}</Typography>
    </div>
}
export default Friend;

type ContactProps = {
    friend: TypeFriend,
    onClick: (friend: Friend) => void
}

