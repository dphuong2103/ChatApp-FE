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

    async function handleSetCurrentChatRoomSummary(chatRoomSummary: ChatRoomSummary) {
        let newChatRoomId = chatRoomSummary.chatRoom.id;
        let oldChatRoomId: string | undefined;
        setNewChat(null);
        setCurrentChatRoomSummary(prev => {
            oldChatRoomId = prev?.chatRoom.id
            if (oldChatRoomId === newChatRoomId) return prev;
            return { ...chatRoomSummary }
        });
        setShowChatRoom(true);
        if (newChatRoomId === oldChatRoomId) return;
        dispatchMessage({ type: MessagesActionType.DELETEALL })
        await firstGetMessagesByChatRoomId(chatRoomSummary.chatRoom.id);
        dispatchChatRoomSummary({ type: ChatRoomSummaryActionType.UPDATELATESTMESSAGE, payload: updateChatRoomLastSeenMessagesOnOpenNewChatRoom(chatRoomSummary.chatRoom.id) })

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
        dispatchChatRoomSummary({ type: ChatRoomSummaryActionType.UPDATELATESTMESSAGE, payload: handleUpdateChatRoomSummary(message) })
    }


    function handleUpdateChatRoomSummary(message: Message) {
        let updatedChatRoomSummaries = chatRoomSummaries.map(chatRoomSummary => {
            if (chatRoomSummary.chatRoom.id === message.chatRoomId) {
                if (!chatRoomSummary.latestMessage) {
                    chatRoomSummary.latestMessage = message
                    return chatRoomSummary;
                }
                var oldMessageDate = new Date(chatRoomSummary.latestMessage.createdTime);
                var newMessageDate = new Date(message.createdTime);
                if (oldMessageDate.getTime() > newMessageDate.getTime()) {
                    return chatRoomSummary
                }
                chatRoomSummary.latestMessage = message;
                if (message.chatRoomId !== currentChatRoomSummary?.chatRoom.id) {
                    if (!chatRoomSummary.numberOfUnreadMessages) {
                        chatRoomSummary.numberOfUnreadMessages = 1;
                    }
                    else { chatRoomSummary.numberOfUnreadMessages += 1 };
                }
                return chatRoomSummary;
            }
            return chatRoomSummary
        })
        return updatedChatRoomSummaries;
    }

    function handleNewChatSelect(user: User) {
        const users: User[] = [currentUser!, user];
        setNewChat({ users });
        setCurrentChatRoomInfo({
            name: user.displayName,
            imgUrl: user.photoUrl,
            partners: [user]
        })
        setShowChatRoom(true);
        dispatchMessage({ type: MessagesActionType.DELETEALL })
        setCurrentChatRoomInfo({
            name: user.displayName,
            imgUrl: user.photoUrl,
            partners: [user]
        });
    }

    function updateChatRoomLastSeenMessagesOnOpenNewChatRoom(chatRoomId: string) {
        let updatedChatRoomSummaries = chatRoomSummaries.map(chatRoomSummary => {
            if (chatRoomSummary.chatRoom.id === chatRoomId) {
                chatRoomSummary.numberOfUnreadMessages = undefined;
            }
            return chatRoomSummary;
        })
        return updatedChatRoomSummaries;
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
    }, [currentChatRoomSummary, newChat])

    useEffect(() => {
        setCurrentChatRoomSummary(prev => {
            const crs = chatRoomSummaries.find(crs => crs.chatRoom.id === prev?.chatRoom.id)
            if (crs) return { ...crs }
            else return prev;
        })
    }, [chatRoomSummaries])

    useEffect(() => {
        if (currentChatRoomSummary) {
            setCurrentChatRoomInfo(getChatRoomInfo(currentChatRoomSummary));
            return;
        }
    }, [currentChatRoomSummary])

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
    handleSetCurrentChatRoomSummary: (chatRoomSummary: ChatRoomSummary) => void,
    messages: Message[],
    dispatchMessage: React.Dispatch<MessagesActionAndPayloadType>,
    getMessagesPageByChatRoomId: () => Promise<void>;
    currentChatRoomInfo: ChatRoomInfo | null;
    newChat: NewChat | null;
    handleNewChatSelect: (user: User) => void
}