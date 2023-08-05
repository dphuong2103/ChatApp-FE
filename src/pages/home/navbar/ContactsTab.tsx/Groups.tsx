import { useEffect, useState } from 'react';
import { useChatRoomSummaryContext } from '../../../../helper/getContext';
import styles from '../../../../styles/Groups.module.scss';
import { ChatRoomSummary } from '../../../../types/dataType';
function Groups() {
    const { chatRoomSummaries } = useChatRoomSummaryContext();
    const [groups, setGroups] = useState<ChatRoomSummary[]>([]);

    useEffect(() => {
        let groups = chatRoomSummaries.filter(ChatRoomSummary => ChatRoomSummary.chatRoom.chatRoomType === 'MANY');
        setGroups(groups);
    }, [])

    return <div className={styles['groups-container']}>
    </div>
}
export default Groups;