import { IconButton, Typography } from '@mui/material';
import styles from '../../../styles/ChatMember.module.scss';
import { User } from '../../../types/dataType';
import Avatar from '../../../components/Avatar';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
function ChatMember({ user, onMenuClick }: ChatMemberProps) {

    function handleMenuClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        onMenuClick(event.currentTarget, user);
    }

    return <div className={styles['chat-member-container']} >
        <Avatar name={user.displayName} imgUrl={user.photoUrl} />
        <Typography variant='body1' fontWeight={500}>{user.displayName}</Typography>
        <IconButton className={styles['menu']} onClick={handleMenuClick}>
            <MoreHorizIcon />
        </IconButton>
    </div>
}
export default ChatMember;

type ChatMemberProps = {
    user: User,
    onMenuClick: (anchor: HTMLElement, user: User) => void
}

