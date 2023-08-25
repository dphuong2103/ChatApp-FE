
import { useChatContext, useCurrentChatRoomContext } from '@helper/getContext';
import styles from '@styles/ChatViewContainer.module.scss';
import { generateClassName } from '@helper/generateClassName';
import ActionBar from '../action-bar/ActionBar';
import ChatContent from './ChatContent';
import EmptyChat from '../EmptyChat';
import NavBar from '../nav-bar/NavBar';

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