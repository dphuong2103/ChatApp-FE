import { createContext, useEffect, useReducer, useState } from 'react'
import { ChatRoom, ChatRoomIdAndName, ChatRoomIdAndUserId, ChatRoomIdAndUsers, ChatRoomSummary, ChatRoomSummaryActionType, ChatRoomSummaryConnectionFunction, ConnectionFunction, ContextChildren, Message, User, UserChatRoom, UserRelationship } from '../types/dataType';
import { sortChatRoomSummary } from '../helper/filterDuplicateItemInArray';
import { ChatRoomAPI, UserRelationshipAPI } from '../api';
import { useHubConnection } from '../helper/getContext';
import { isChatRoomSummary } from '../helper/checkType';
import store from '../redux/store';

type ChatRoomSummaryAction = {
    type: ChatRoomSummaryActionType.FIRSTGET
    payload: ChatRoomSummary[]
} | {
    type: ChatRoomSummaryActionType.UPSERT
    payload: ChatRoomSummary
} | {
    type: ChatRoomSummaryActionType.UPDATELATESTMESSAGE
    payload: ChatRoomSummary[]
} | {
    type: ChatRoomSummaryActionType.USERTUSERCHATROOM
    payload: UserChatRoom
} | {
    type: ChatRoomSummaryActionType.RemoveUserFromGroupChat
    payload: ChatRoomIdAndUserId
} | {
    type: ChatRoomSummaryActionType.AddMembersToChatRoom,
    payload: ChatRoomIdAndUsers
} | {
    type: ChatRoomSummaryActionType.UpdateChatRoomName,
    payload: ChatRoomIdAndName
} | {
    type: ChatRoomSummaryActionType.DeleteAll
} | {
    type: ChatRoomSummaryActionType.UpdateUnReadMessageCountOnChatRoomOpen,
    payload: string
} | {
    type: ChatRoomSummaryActionType.UpdateChatRoomSMROnReceiveMessage,
    payload: {
        message: Message,
        currentChatRoomId?: string
    }
} | {
    type: ChatRoomSummaryActionType.UpdateUser,
    payload: User
} | {
    type: ChatRoomSummaryActionType.UpdateChatRoom,
    payload: ChatRoom
}


const initState: ChatRoomSummary[] = [];

const reducer = (state: ChatRoomSummary[], action: ChatRoomSummaryAction) => {
    switch (action.type) {
        case ChatRoomSummaryActionType.FIRSTGET:
            if (state.length === action.payload.length) {
                return [...sortChatRoomSummary(action.payload)];
            } else {
                const values = sortChatRoomSummary([...state, ...action.payload]);
                return [...values];
            }
        case ChatRoomSummaryActionType.UPSERT: {
            console.log('ChatRoomSummaryActionType.UPSERT')
            return [...handeUpsertChatRoomSummary(state, action.payload)]
        };
        case ChatRoomSummaryActionType.UPDATELATESTMESSAGE: {
            console.log('ChatRoomSummaryActionType.UPDATELATESTMESSAGE')
            return [...sortChatRoomSummary(action.payload)]
        };
        case ChatRoomSummaryActionType.USERTUSERCHATROOM: {
            console.log('ChatRoomSummaryActionType.USERTUSERCHATROOM')
            return [...handleUpdateUserChatRoom(action.payload, state)]
        };
        case ChatRoomSummaryActionType.RemoveUserFromGroupChat: {
            console.log('ChatRoomSummaryActionType.RemoveUserFromGroupChat')
            return [...handleRemoveUserFromGroupChat(state, action.payload)]
        }
        case ChatRoomSummaryActionType.AddMembersToChatRoom: {
            console.log('ChatRoomSummaryActionType.AddMembersToChatRoom')
            return [...handleAddMembersToChatRoom(state, action.payload)]
        }
        case ChatRoomSummaryActionType.UpdateChatRoomName: {
            console.log('ChatRoomSummaryActionType.UpdateChatRoomName')
            return [...handleUpdateChatRoomName(state, action.payload)]
        }

        case ChatRoomSummaryActionType.DeleteAll: {
            console.log('ChatRoomSummaryActionType.DeleteAll')
            return [];
        }
        case ChatRoomSummaryActionType.UpdateUnReadMessageCountOnChatRoomOpen: {
            return state.map(crs => {
                if (crs.chatRoom.id === action.payload) {
                    crs.numberOfUnreadMessages = undefined;
                }
                return { ...crs }
            });
        }
        case ChatRoomSummaryActionType.UpdateChatRoomSMROnReceiveMessage: {
            return [...sortChatRoomSummary(handleUpdateCRSOnReceiveMessage(state, action.payload.message, action.payload.currentChatRoomId))]
        }
        case ChatRoomSummaryActionType.UpdateUser: {
            return [...handleUpdateUser(state, action.payload)]
        }
        case ChatRoomSummaryActionType.UpdateChatRoom: {
            return [...handleUpdateChatRoom(state, action.payload)]
        }
    }
}

function handleRemoveUserFromGroupChat(state: ChatRoomSummary[], request: ChatRoomIdAndUserId) {
    const currentUserId = store.getState().auth.user?.id;
    if (!currentUserId) return state;
    if (request.userId === currentUserId) {
        state = state.filter(crs => crs.chatRoom.id !== request.chatRoomId);
        return state;
    }
    return state.map(crs => {
        if (crs.chatRoom.id === request.chatRoomId) {
            crs.users = crs.users.filter(u => u.id !== request.userId);
        }
        return crs;
    })
}

function handleUpdateChatRoom(state: ChatRoomSummary[], request: ChatRoom) {
    return state.map(crs => {
        if (crs.chatRoom.id === request.id) {
            crs.chatRoom = request;
            return { ...crs };
        }
        return crs;
    })
}

function handleUpdateUser(state: ChatRoomSummary[], request: User) {

    return state.map((chatRoomSummary) => {
        const updatedUsers = chatRoomSummary.users.map((user) => {
            if (user.id === request.id) {
                return request;
            } else {
                return user;
            }
        });

        return { ...chatRoomSummary, users: updatedUsers };
    });
}

function handleUpdateUserChatRoom(userChatRoom: UserChatRoom, state: ChatRoomSummary[]) {
    state.map(crs => {
        if (crs.chatRoom.id === userChatRoom.chatRoomId) {
            crs.userChatRoom = userChatRoom
            return { ...crs };
        }
        return crs;
    })
    return state;
}

function handleUpdateCRSOnReceiveMessage(state: ChatRoomSummary[], message: Message, currentChatRoomId?: string) {
    if (message.chatRoomId === currentChatRoomId) {
        const updatedChatRoomSummaries = state.map(crs => {
            if (crs.chatRoom.id === currentChatRoomId) {
                crs.latestMessage = message;
                return { ...crs };
            }
            return crs;
        })
        return updatedChatRoomSummaries;
    }
    const updatedChatRoomSummaries = state.map(crs => {
        if (crs.chatRoom.id !== message.chatRoomId) return crs;

        if (!crs.latestMessage) {
            crs.latestMessage = message;
            crs.numberOfUnreadMessages = 1;
            return { ...crs };
        }

        var oldMessageDate = new Date(crs.latestMessage.createdTime);
        var newMessageDate = new Date(message.createdTime);
        if (oldMessageDate.getTime() > newMessageDate.getTime()) {
            return crs
        }
        crs.latestMessage = message;
        if (message.chatRoomId) {
            if (!crs.numberOfUnreadMessages) {
                crs.numberOfUnreadMessages = 1;
            }
            else { crs.numberOfUnreadMessages += 1 };
        }

        return { ...crs };
    })

    return updatedChatRoomSummaries;
}

function handleUpdateChatRoomName(state: ChatRoomSummary[], request: ChatRoomIdAndName) {
    const newState = [...state.map(crs => {
        if (crs.chatRoom.id === request.chatRoomId) {
            crs.chatRoom.name = request.name;
            return { ...crs };
        }
        return crs;
    })]
    return newState;
}

function handeUpsertChatRoomSummary(state: ChatRoomSummary[], payload: ChatRoomSummary) {
    let chatRoomExists = false;
    state.map(crSummary => {
        if (crSummary.chatRoom.id === payload.chatRoom.id) {
            chatRoomExists = true;
            return payload
        }
        else { return crSummary }
    })

    if (!chatRoomExists) {
        state.unshift(payload)
    }

    return state;
}

function handleAddMembersToChatRoom(state: ChatRoomSummary[], request: ChatRoomIdAndUsers) {
    return state.map(crs => {
        if (crs.chatRoom.id === request.chatRoomId) {
            crs.users = [...crs.users, ...request.users];
        }
        return crs;
    })
}

export const ChatRoomSummaryContextProvider = createContext({} as ChatRoomSummaryContextValue);

function ChatRoomSummaryContext({ children }: ContextChildren) {
    const [chatRoomSummaries, dispatchChatRoomSummary] = useReducer(reducer, initState);
    const [relationships, setRelationships] = useState<UserRelationship[]>([]);
    const { connection } = useHubConnection();
    const [loadingChatRoomSummary, setLoadingChatRoomSummary] = useState(true);
    const authState = store.getState().auth;

    useEffect(() => {
        const abortController = new AbortController();
        if (authState.user?.id || connection?.state === 'Connected') {
            getChatRoomSummaries();
            getUserRelationships();
            async function getChatRoomSummaries() {
                setLoadingChatRoomSummary(true);
                try {
                    const chatRoomSummariesResponse = await ChatRoomAPI.getUserChatRooms(abortController);
                    if (chatRoomSummariesResponse?.data && chatRoomSummariesResponse.data.length > 0) {
                        dispatchChatRoomSummary({ type: ChatRoomSummaryActionType.FIRSTGET, payload: chatRoomSummariesResponse.data })
                    }
                } catch (err) {
                    console.error(err);
                }
                finally {
                    setLoadingChatRoomSummary(false);
                }
            };

            async function getUserRelationships() {
                try {
                    const userRelationships = await UserRelationshipAPI.getUserRelationship(abortController);
                    if (userRelationships != null) {
                        setRelationships(userRelationships.data);
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        }

        return () => {
            abortController.abort();
        }

    }, [authState.user?.id, connection?.state])
    useEffect(() => {
        if (!authState.isLoggedIn) {
            dispatchChatRoomSummary({ type: ChatRoomSummaryActionType.DeleteAll })
        }
    }, [authState.isLoggedIn])

    useEffect(() => {
        if (connection?.state === 'Connected') {
            connection.on(ChatRoomSummaryConnectionFunction.RemoveUserFromGroupChat, (request: ChatRoomIdAndUserId) => {
                dispatchChatRoomSummary({ type: ChatRoomSummaryActionType.RemoveUserFromGroupChat, payload: request })
            })

            connection.on(ChatRoomSummaryConnectionFunction.AddMembersToChatRoom, (request: ChatRoomIdAndUsers) => {
                dispatchChatRoomSummary({ type: ChatRoomSummaryActionType.AddMembersToChatRoom, payload: request })
            })
            connection.on(ConnectionFunction.ReceivedChatRoomSummary, (newChatRoomSummary: ChatRoomSummary) => {
                if (isChatRoomSummary(newChatRoomSummary)) {
                    dispatchChatRoomSummary({ type: ChatRoomSummaryActionType.UPSERT, payload: newChatRoomSummary })
                }
            })
            connection.on(ConnectionFunction.ReceivedRelationship, (userRelationship: UserRelationship, type: 'Add' | 'Update' | 'Delete') => {
                setRelationships(prev => [...handleUpsertRelationship(prev, userRelationship, type)])
            })

            connection.on(ChatRoomSummaryConnectionFunction.UpdateChatRoomName, (request: ChatRoomIdAndName) => {
                dispatchChatRoomSummary({ type: ChatRoomSummaryActionType.UpdateChatRoomName, payload: request })
            })

            connection.on(ChatRoomSummaryConnectionFunction.ReceivedChatRoom, (request: ChatRoom) => {
                dispatchChatRoomSummary({ type: ChatRoomSummaryActionType.UpdateChatRoom, payload: request })
            })

        }

    }, [connection?.state])

    function handleUpsertRelationship(relationships: UserRelationship[], response: UserRelationship, type: 'Add' | 'Update' | 'Delete') {
        switch (type) {
            case 'Add': {
                return [...relationships, response];
            }
            case 'Delete': {
                const updatedRelationship = relationships.filter(relationship => relationship.id !== response.id)
                return updatedRelationship
            };
            case 'Update': {
                let updatedRelationship = relationships.map(relationship => {
                    if (relationship.id === response.id) {

                        return response;
                    } else return relationship;
                });
                return updatedRelationship
            }
            default:
                return relationships;
        }
    }

    return (
        <ChatRoomSummaryContextProvider.Provider value={{ chatRoomSummaries, dispatchChatRoomSummary, relationships, setRelationships, loadingChatRoomSummary }}>{children}</ChatRoomSummaryContextProvider.Provider>
    )
}

export default ChatRoomSummaryContext;

type ChatRoomSummaryContextValue = {
    chatRoomSummaries: ChatRoomSummary[];
    dispatchChatRoomSummary: React.Dispatch<ChatRoomSummaryAction>,
    relationships: UserRelationship[],
    setRelationships: React.Dispatch<React.SetStateAction<UserRelationship[]>>,
    loadingChatRoomSummary: boolean
}