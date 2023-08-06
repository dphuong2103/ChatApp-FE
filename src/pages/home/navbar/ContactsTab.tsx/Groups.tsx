import { useEffect, useState } from 'react';
import { useChatRoomSummaryContext } from '../../../../helper/getContext';
import styles from '../../../../styles/Groups.module.scss';
import { ChatRoomSummary } from '../../../../types/dataType';
import Group from './Group';
function Groups() {
    const { chatRoomSummaries } = useChatRoomSummaryContext();
    const [groups, setGroups] = useState<ChatRoomSummary[]>([]);

    useEffect(() => {
        let groups = chatRoomSummaries.filter(ChatRoomSummary => ChatRoomSummary.chatRoom.chatRoomType === 'MANY');
        setGroups(groups);
    }, [chatRoomSummaries])

    return <div className={styles['groups-container']}>
        {groups.map(group => <Group chatRoomSummary={group} key={group.chatRoom.id} />)}
    </div>
}
export default Groups;