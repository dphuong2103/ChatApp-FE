import { useChatRoomSummaryContext, useCurrentChatRoomContext } from '../../helper/getContext';
import styles from '../../styles/ChatRooms.module.scss'
import { ChatRoomSummary } from '../../types/dataType';
import ChatRoom from './ChatRoom';
import LoadingChatRoom from './LoadingChatRoom';
const loadingChatRooms = [1, 2, 3, 4, 5];
function ChatRooms() {
    const { handleSetCurrentChatRoomSummary, currentChatRoomSummary } = useCurrentChatRoomContext();
    const { chatRoomSummaries, loadingChatRoomSummary } = useChatRoomSummaryContext();

    function handleOnClickChatRoom(chatRoomSummary: ChatRoomSummary) {
        handleSetCurrentChatRoomSummary(chatRoomSummary);
    }
    return (
        <div className={styles['chatrooms-container']}>
            {
                loadingChatRoomSummary && loadingChatRooms.map(item => <LoadingChatRoom key={item} />)
            }
            {
                !loadingChatRoomSummary && chatRoomSummaries.map(chatRoomSummary => <ChatRoom
                    chatRoomSummary={chatRoomSummary}
                    key={chatRoomSummary.chatRoom.id}
                    onClick={handleOnClickChatRoom}
                    isSelected={currentChatRoomSummary?.chatRoom.id === chatRoomSummary.chatRoom.id} />)
            }
        </div>
    )
}

export default ChatRooms