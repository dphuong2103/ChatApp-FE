import { ChatRoomInfo, ChatRoomSummary } from '../../../../types/dataType'
import styles from '../../../../styles/Group.module.scss';
import Avatar from '../../../../components/Avatar';
import { useEffect, useState } from 'react';
import { getChatRoomInfo } from '../../../../helper/chatRoomHelper';
import Typography from '@mui/material/Typography/Typography';

function Group({ chatRoomSummary, onClick }: GroupProps) {
    const [chatRoomInfo, setChatRoomInfo] = useState<ChatRoomInfo | null>(null);

    useEffect(() => {
        if (chatRoomSummary) {
            setChatRoomInfo(getChatRoomInfo(chatRoomSummary))
        }
    }, [chatRoomSummary])
    return (
        <div className={styles['group-container']} onClick={onClick}>
            <Avatar name={chatRoomInfo?.name} imgUrl={chatRoomInfo?.imgUrl} />
            <Typography variant='body1' fontWeight={500}>{chatRoomInfo?.name}</Typography>
        </div>
    )
}

export default Group

type GroupProps = {
    chatRoomSummary: ChatRoomSummary,
    onClick: () => void
}