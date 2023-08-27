import { createContext, useEffect, useReducer, useState } from 'react';
import { ChatRoomInfo, ChatRoomSummary, ChatRoomSummaryActionType, ConnectionFunction, Message, MessagesActionType, NewChat, UploadTask, User } from '@data-type';
import { useChatRoomSummaryContext, useHubConnection } from '@helper/getContext';
import { MessageAPI, UserChatRoomAPI } from '@api';
import { handleGetMessageUploadTask, handleTransFormMessages, handleUpsertOrDeleteMessage } from '@helper/messageHelper';
import { getChatRoomInfo } from '@helper/chatRoomHelper';
import { useAppSelector } from '../redux/store';
import { uploadFileTask } from '../hooks/useUploadFile';
import useFetchApi, { apiRequest } from '@hooks/useApi';

export const CurrentChatRoomContext = createContext({} as showChatRoomContextProps);

type MessagesActionAndPayloadType = {
    type: MessagesActionType.FIRSTGET | MessagesActionType.GETLIST | MessagesActionType.GetMissingMessages,
    payload: Message[],
} | {
    type: MessagesActionType.UPSERTORDELETEMESSAGE,
    payload: Message,
} | {
    type: MessagesActionType.DELETEALL,
} | {
    type: MessagesActionType.CancelUploadingMessageFile,
    payload: string
}

const messageReducer = (state: Message[], action: MessagesActionAndPayloadType) => {
    switch (action.type) {
        case MessagesActionType.FIRSTGET:
            if (state.length === action.payload.length) {
                return [...handleTransFormMessages(action.payload)]
            } else {
                return [...handleTransFormMessages(state.concat(action.payload))]
            }
        case MessagesActionType.UPSERTORDELETEMESSAGE: return handleUpsertOrDeleteMessage(state, action.payload);
        case MessagesActionType.GETLIST: return handleGetList(action.payload, state);
        case MessagesActionType.DELETEALL: return [];
        case MessagesActionType.CancelUploadingMessageFile: return [...handleCancelUploadingMessageFile(action.payload, state)];
        case MessagesActionType.GetMissingMessages: return handleGetMissingMessages(action.payload, state);
    }
}

function handleGetList(payload: Message[], state: Message[]) {
    const updateNewMessages = handleTransFormMessages(payload);
    return [...updateNewMessages, ...state]
}

function handleGetMissingMessages(payload: Message[], state: Message[]) {
    const updateNewMessages = handleTransFormMessages(payload);
    return [...state, ...updateNewMessages];
}

function handleCancelUploadingMessageFile(messageId: string, state: Message[]) {
    return state.map(m => {
        if (m.id === messageId && m.type === 'Files') {
            m.fileStatus = 'Cancelled';
            return { ...m }
        }
        return m;
    })
}

export default function CurrentChatRoom({ children }: { children: React.ReactNode }) {
    const [showChatRoom, setShowChatRoom] = useState(false);
    const [currentChatRoomSummary, setCurrentChatRoomSummary] = useState<ChatRoomSummary | null>(null);
    const [messages, dispatchMessage] = useReducer(messageReducer, []);
    const { connection } = useHubConnection();
    const { dispatchChatRoomSummary, chatRoomSummaries, relationships } = useChatRoomSummaryContext();
    const [currentChatRoomInfo, setCurrentChatRoomInfo] = useState<ChatRoomInfo | null>(null);
    const [newChat, setNewChat] = useState<NewChat | null>(null);
    const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
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
        setShowChatRoom(true);
        if (newChatRoomId === oldChatRoomId) return;
        dispatchMessage({ type: MessagesActionType.DELETEALL });
        if (newChatRoom) return;
        await firstGetMessagesByChatRoomId(chatRoomSummary.chatRoom.id);
        dispatchChatRoomSummary({
            type: ChatRoomSummaryActionType.UpdateUnReadMessageCountOnChatRoomOpen,
            payload: chatRoomSummary.chatRoom.id
        });
    }

    async function firstGetMessagesByChatRoomId(chatRoomId: string) {
        let { data: messagesData } = await apiRequest({ request: () => MessageAPI.getMessagesPageByChatRoomId(chatRoomId, 30) })
        if (!(uploadTasks.length === 0) && messagesData && messagesData.length > 0) {
            messagesData = messagesData.map(m => handleGetMessageUploadTask(m, uploadTasks));
        }
        messagesData && dispatchMessage({ type: MessagesActionType.FIRSTGET, payload: messagesData });

    }

    async function getMessagesPageByChatRoomId() {
        if (!messages || !currentChatRoomSummary) return;
        let { data: messagesData } = await apiRequest({ request: () => MessageAPI.getMessagesPageByChatRoomId(currentChatRoomSummary.chatRoom.id, 30, messages[0].id) })
        if (messagesData) {
            messagesData = messagesData.map(m => handleGetMessageUploadTask(m, uploadTasks));
            dispatchMessage({ type: MessagesActionType.GETLIST, payload: messagesData });
        }
    }

    function receivedMessage(message: Message) {
        if (message.chatRoomId === currentChatRoomSummary?.chatRoom.id) {
            dispatchMessage({ type: MessagesActionType.UPSERTORDELETEMESSAGE, payload: message });
        };

        dispatchChatRoomSummary({
            type: ChatRoomSummaryActionType.UpdateChatRoomSMROnReceiveMessage, payload: {
                message: message,
                currentChatRoomId: currentChatRoomSummary?.chatRoom.id,
            }
        });
    }

    function handleNewChatSelect(user: User) {
        const users: User[] = [currentUser!, user];
        setCurrentChatRoomSummary(null);
        setNewChat({ users });
        setShowChatRoom(true);
        dispatchMessage({ type: MessagesActionType.DELETEALL });
        setCurrentChatRoomInfo({
            name: user.displayName,
            imgUrl: user.photoUrl,
            partners: [user],
            relationshipStatus: 'NotFriend'
        });
    }

    function handleAddMessageForFileUpload(message: Message & ({
        type: 'Files',
        fileStatus: 'InProgress'
    } | {
        type: 'AudioRecord',
        fileStatus: 'InProgress'
    }
    )) {
        if ((message.type === 'Files') && message.fileStatus === 'InProgress') {
            const uploadTask = uploadFileTask(message, () => {
                setUploadTasks(prev => [...prev].filter(ut => ut !== uploadTask));
            });
            message.uploadTask = uploadTask;
            setUploadTasks(prev => [...prev, uploadTask]);
            dispatchMessage({ type: MessagesActionType.UPSERTORDELETEMESSAGE, payload: message });
        }
        else if ((message.type === 'AudioRecord') && message.fileStatus === 'InProgress') {
            const uploadTask = uploadFileTask(message);
            message.uploadTask = uploadTask;
            setUploadTasks(prev => [...prev, uploadTask]);
            dispatchMessage({ type: MessagesActionType.UPSERTORDELETEMESSAGE, payload: message });
        }
    }

    useEffect(() => {
        handleSetChatRoomInfo();
        function handleSetChatRoomInfo() {
            if (!newChat && chatRoomSummaries.length > 0 && currentChatRoomSummary) {
                setCurrentChatRoomInfo(getChatRoomInfo(currentChatRoomSummary, relationships));
            }
        }
    }, [chatRoomSummaries, currentChatRoomSummary, relationships, newChat])

    //Update lastmessageread when there is a new message for current chatroom
    useFetchApi({
        request: (currentChatRoomSummary && messages.length > 0) ? () => UserChatRoomAPI.updateUserChatRoomLastMessageRead({
            id: currentChatRoomSummary.userChatRoom.id,
            lastMessageReadId: messages[messages.length - 1].id,
        }) : undefined,
        dependencies: [messages]
    });

    useEffect(() => {
        if (connection && !currentChatRoomSummary) {
            connection.on(ConnectionFunction.ReceivedMessage, (message: Message) => {
                receivedMessage(message);
            })
        }

        if (connection && currentChatRoomSummary) {
            connection.off(ConnectionFunction.ReceivedMessage);
            connection.on(ConnectionFunction.ReceivedMessage, (message: Message) => {
                receivedMessage(message);
            })
        }

    }, [currentChatRoomSummary, connection?.connectionId])

    useFetchApi({
        request: connection?.state === 'Connected' ? () => MessageAPI.getMissingMessages(messages[messages.length - 1].id) : undefined,
        dependencies: [connection?.state],
        onFinish: async (data) => {
            if (data && data.length > 0) {
                dispatchMessage({ type: MessagesActionType.GetMissingMessages, payload: data.map(m => handleGetMessageUploadTask(m, uploadTasks)) });
            } else {
                await firstGetMessagesByChatRoomId(currentChatRoomSummary!.chatRoom.id);
            }
        },
    });

    useEffect(() => {
        setCurrentChatRoomSummary(prev => {
            const crs = chatRoomSummaries.find(crs => crs.chatRoom.id === prev?.chatRoom.id);
            return crs ? { ...crs } : null;
        })

    }, [chatRoomSummaries])

    return (
        <CurrentChatRoomContext.Provider value={{
            showChatRoom,
            setShowChatRoom,
            currentChatRoomSummary,
            handleSetCurrentChatRoomSummary,
            messages,
            dispatchMessage,
            getMessagesPageByChatRoomId,
            currentChatRoomInfo,
            newChat,
            handleNewChatSelect,
            handleAddMessageForFileUpload
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
    handleNewChatSelect: (user: User) => void;
    handleAddMessageForFileUpload: (message: Message & ({
        type: 'Files',
        fileStatus: 'InProgress'
    } | {
        type: 'AudioRecord',
        fileStatus: 'InProgress'
    }
    )) => void
}