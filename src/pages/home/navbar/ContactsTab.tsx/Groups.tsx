import { useEffect, useState } from 'react';
import { useChatRoomSummaryContext, useCurrentChatRoomContext } from '../../../../helper/getContext';
import styles from '../../../../styles/Groups.module.scss';
import { ChatRoomSummary } from '../../../../types/dataType';
import Group from './Group';
function Groups() {
    const { chatRoomSummaries } = useChatRoomSummaryContext();
    const { handleSetCurrentChatRoomSummary } = useCurrentChatRoomContext();
    const [groups, setGroups] = useState<ChatRoomSummary[]>([]);

    function handleClickGroup(crs: ChatRoomSummary) {
        handleSetCurrentChatRoomSummary(crs);
    }

    useEffect(() => {
        let groups = chatRoomSummaries.filter(ChatRoomSummary => ChatRoomSummary.chatRoom.chatRoomType === 'MANY');
        setGroups(groups);
    }, [chatRoomSummaries])

    return <div className={styles['groups-container']}>
        {groups.map(group => <Group chatRoomSummary={group} key={group.chatRoom.id} onClick={() => handleClickGroup(group)} />)}
    </div>
}
export default Groups;