
import { useChatContext, useCurrentChatRoomContext } from '../../../helper/getContext';
import styles from '../../../styles/ChatViewContainer.module.scss';
import { generateClassName } from '../../../utils/generateClassName';
import EmptyChat from '../EmptyChat';
import ActionBar from './ActionBar';
import ChatContent from './ChatContent';
import NavBar from './NavBar';

function ChatViewContainer() {
    const { showChatRoom } = useCurrentChatRoomContext();
    const { showChatInfo } = useChatContext();
    const { currentChatRoomSummary, newChat } = useCurrentChatRoomContext();
    if (!currentChatRoomSummary && !newChat) return <EmptyChat />
    return (
        <main className={generateClassName(styles, ['chat-view-container', ...(!showChatRoom || showChatInfo) ? ['d-none'] : []])}>
            <NavBar />
            <ChatContent />
            <ActionBar />
        </main>
    )
}

export default ChatViewContainer