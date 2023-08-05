import { createContext, useEffect, useState } from 'react'
import { ChatRoomSummary, ContextChildren, Message, NewChat } from '../types/dataType';
import { useCurrentChatRoomContext } from '../helper/getContext';

export const ChatMessageContext = createContext({} as ChatContextProviderValue);

function ChatContextProvider({ children }: ContextChildren) {
    const [replyToMessage, setReplyToMessage] = useState<Message | null | undefined>(null);
    const { currentChatRoomSummary, newChat } = useCurrentChatRoomContext();
    const [showChatInfo, setShowChatInfo] = useState(false);
    const [currentChatRoomSummaryOrNewChatRoom, setCurrentChatRoomSummaryOrNewChatRoom] = useState<NewChat | ChatRoomSummary | null>(null);
    function handleSetReplyToMessage(message?: Message | null) {
        setReplyToMessage(message);
    }


    useEffect(() => {
        if (newChat) {
            setCurrentChatRoomSummaryOrNewChatRoom(newChat)
            return;
        }
    }, [newChat])


    useEffect(() => {
        if (!currentChatRoomSummary && !newChat) {
            setShowChatInfo(false);
            setReplyToMessage(null);
        }
        if (currentChatRoomSummary) {
            setReplyToMessage(null);
            setShowChatInfo(false);
        }
    }, [currentChatRoomSummary?.chatRoom.id])

    

    return (
        <ChatMessageContext.Provider value={{ replyToMessage, handleSetReplyToMessage, showChatInfo, setShowChatInfo, currentChatRoomSummaryOrNewChatRoom }}>{children}</ChatMessageContext.Provider>
    )
}

export default ChatContextProvider

type ChatContextProviderValue = {
    replyToMessage?: Message | null,
    handleSetReplyToMessage: (message?: Message | null) => void,
    showChatInfo?: boolean,
    setShowChatInfo: React.Dispatch<React.SetStateAction<boolean>>,
    currentChatRoomSummaryOrNewChatRoom: ChatRoomSummary | NewChat | null,
}