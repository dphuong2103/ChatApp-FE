import { createContext, useEffect, useReducer, useState } from 'react';
import { ChatRoomInfo, ChatRoomSummary, ChatRoomSummaryActionType, ConnectionFunction, Message, MessagesActionType, NewChat, UpdateLastMessageRead, User } from '../types/dataType';
import { useChatRoomSummaryContext, useHubConnection } from '../helper/getContext';
import { MessageAPI, UserChatRoomAPI } from '../api';
import { handleTransFormMessages, handleUpsertOrDeleteMessage } from '../helper/messageHelper';
import { getChatRoomInfo } from '../helper/chatRoomHelper';
import { useAppSelector } from '../redux/store';

export const CurrentChatRoomContext = createContext({} as showChatRoomContextProps);

type MessagesActionAndPayloadType = {
    type: MessagesActionType.FIRSTGET | MessagesActionType.GETLIST,
    payload: Message[],
} | {
    type: MessagesActionType.UPSERTORDELETEMESSAGE,
    payload: Message,
} | {
    type: MessagesActionType.DELETEALL,
}
const messageReducer = (state: Message[], action: MessagesActionAndPayloadType) => {
    switch (action.type) {
        case MessagesActionType.FIRSTGET:
            if (state.length === action.payload.length) {
                return [...handleTransFormMessages(action.payload)]
            } else {
                return [...handleTransFormMessages(state.concat(action.payload))]
            }
        case MessagesActionType.UPSERTORDELETEMESSAGE: return [...handleTransFormMessages(handleUpsertOrDeleteMessage(state, action.payload))];
        case MessagesActionType.GETLIST: return [...handleTransFormMessages(state.concat(action.payload))]
        case MessagesActionType.DELETEALL: return [];
    }
}

export default function CurrentChatRoom({ children }: { children: React.ReactNode }) {
    const [showChatRoom, setShowChatRoom] = useState(false);
    const [currentChatRoomSummary, setCurrentChatRoomSummary] = useState<ChatRoomSummary | null>(null);
    const [messages, dispatchMessage] = useReducer(messageReducer, []);
    const { connection } = useHubConnection();
    const { dispatchChatRoomSummary, chatRoomSummaries } = useChatRoomSummaryContext();
    const [currentChatRoomInfo, setCurrentChatRoomInfo] = useState<ChatRoomInfo | null>(null);
    const [newChat, setNewChat] = useState<NewChat | null>(null);
    const currentUser = useAppSelector(state => state.auth.user);

    async function handleSetCurrentChatRoomSummary(chatRoomSummary: ChatRoomSummary, newChatRoom?: boolean) {
        let newChatRoomId = chatRoomSummary.chatRoom.id;
        let oldChatRoomId: string | undefined;
        setNewChat(null);
        setCurrentChatRoomSummary(prev => {
            oldChatRoomId = prev?.chatRoom.id
            if (oldChatRoomId === newChatRoomId) return prev;
            return { ...chatRoomSummary }
        });
        setCurrentChatRoomInfo(getChatRoomInfo(chatRoomSummary));
        setShowChatRoom(true);
        if (newChatRoomId === oldChatRoomId) return;
        dispatchMessage({ type: MessagesActionType.DELETEALL })
        if (newChatRoom) return;
        await firstGetMessagesByChatRoomId(chatRoomSummary.chatRoom.id);
        dispatchChatRoomSummary({ type: ChatRoomSummaryActionType.UpdateUnReadMessageCountOnChatRoomOpen, payload: chatRoomSummary.chatRoom.id })
    }


    async function firstGetMessagesByChatRoomId(chatRoomId: string) {
        try {
            var messagesResponse = await MessageAPI.getMessagesPageByChatRoomId(chatRoomId, 30);
            dispatchMessage({ type: MessagesActionType.FIRSTGET, payload: messagesResponse.data });
        } catch (err) {
            console.error(err);
        }
    }

    async function getMessagesPageByChatRoomId() {
        if (!messages || !currentChatRoomSummary) return;
        try {
            var messagesResponse = await MessageAPI.getMessagesPageByChatRoomId(currentChatRoomSummary.chatRoom.id, 30, messages[0].id);
            dispatchMessage({ type: MessagesActionType.GETLIST, payload: messagesResponse.data })
        } catch (err) {
            console.error(err);
        }
    }

    function receivedMessage(message: Message) {
        if (message.chatRoomId === currentChatRoomSummary?.chatRoom.id) {
            dispatchMessage({ type: MessagesActionType.UPSERTORDELETEMESSAGE, payload: message })
        }

        dispatchChatRoomSummary({
            type: ChatRoomSummaryActionType.UpdateChatRoomSMROnReceiveMessage, payload: {
                message: message,
                currentChatRoomId: currentChatRoomSummary?.chatRoom.id,
            }
        })
    }

    function handleNewChatSelect(user: User) {
        const users: User[] = [currentUser!, user];
        setCurrentChatRoomSummary(null);
        setNewChat({ users });
        setShowChatRoom(true);
        dispatchMessage({ type: MessagesActionType.DELETEALL })
        setCurrentChatRoomInfo({
            name: user.displayName,
            imgUrl: user.photoUrl,
            partners: [user]
        });
    }

    useEffect(() => {
        updateLastMessageRead();
        async function updateLastMessageRead() {
            if (currentChatRoomSummary && messages.length > 0) {
                try {
                    var updateUserChatRoom: UpdateLastMessageRead = {
                        id: currentChatRoomSummary.userChatRoom.id,
                        lastMessageReadId: messages[messages.length - 1].id,
                    }
                    await UserChatRoomAPI.updateUserChatRoomLastMessageRead(updateUserChatRoom);
                }
                catch (err) {
                    console.error('err', err);
                }
            }
        }
    }, [messages])

    useEffect(() => {
        if (connection) {
            connection.on(ConnectionFunction.ReceivedMessage, (message: Message) => {
                receivedMessage(message);
            })
        }
    }, [connection])

    useEffect(() => {
        if (connection && currentChatRoomSummary) {
            connection.off(ConnectionFunction.ReceivedMessage);
            connection.on(ConnectionFunction.ReceivedMessage, (message: Message) => {
                receivedMessage(message);
            })
        }
    }, [currentChatRoomSummary])

    useEffect(() => {
        setCurrentChatRoomSummary(prev => {
            const crs = chatRoomSummaries.find(crs => crs.chatRoom.id === prev?.chatRoom.id)
            return crs ? { ...crs } : null
        })
    }, [chatRoomSummaries])

    return (
        <CurrentChatRoomContext.Provider value={{
            showChatRoom, setShowChatRoom, currentChatRoomSummary, handleSetCurrentChatRoomSummary, messages, dispatchMessage, getMessagesPageByChatRoomId, currentChatRoomInfo, newChat, handleNewChatSelect
        }}>{children}</CurrentChatRoomContext.Provider>
    )
}

type showChatRoomContextProps = {
    showChatRoom: boolean,
    setShowChatRoom: React.Dispatch<React.SetStateAction<boolean>>,
    currentChatRoomSummary: ChatRoomSummary | null,
    handleSetCurrentChatRoomSummary: (chatRoomSummary: ChatRoomSummary, newChatRoom?: boolean) => void,
    messages: Message[],
    dispatchMessage: React.Dispatch<MessagesActionAndPayloadType>,
    getMessagesPageByChatRoomId: () => Promise<void>;
    currentChatRoomInfo: ChatRoomInfo | null;
    newChat: NewChat | null;
    handleNewChatSelect: (user: User) => void
}