import { useChatRoomSummaryContext, useCurrentChatRoomContext } from '../../helper/getContext';
import styles from '../../styles/ChatRooms.module.scss'
import { ChatRoomSummary } from '../../types/dataType';
import ChatRoom from './ChatRoom';
function ChatRooms() {
    const { handleSetCurrentChatRoomSummary, currentChatRoomSummary } = useCurrentChatRoomContext();
    const { chatRoomSummaries } = useChatRoomSummaryContext();

    function handleOnClickChatRoom(chatRoomSummary: ChatRoomSummary) {
        handleSetCurrentChatRoomSummary(chatRoomSummary);
    }

    return (
        <div className={styles['chatrooms-container']}>
            {chatRoomSummaries.map(chatRoomSummary => <ChatRoom
                chatRoomSummary={chatRoomSummary}
                key={chatRoomSummary.chatRoom.id}
                onClick={handleOnClickChatRoom}
                isSelected={currentChatRoomSummary?.chatRoom.id === chatRoomSummary.chatRoom.id} />)}
        </div>
    )
}

export default ChatRooms