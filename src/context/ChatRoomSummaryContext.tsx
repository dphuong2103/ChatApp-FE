import { createContext, useEffect, useReducer, useState } from 'react'
import { ChatRoomIdAndName, ChatRoomIdAndUserId, ChatRoomIdAndUsers, ChatRoomSummary, ChatRoomSummaryActionType, ChatRoomSummaryConnectionFunction, ConnectionFunction, ContextChildren, UserChatRoom, UserRelationship } from '../types/dataType';
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
        case ChatRoomSummaryActionType.UPSERT: return [...sortChatRoomSummary(handeUpsertChatRoom(state, action.payload))];
        case ChatRoomSummaryActionType.UPDATELATESTMESSAGE: return [...sortChatRoomSummary(action.payload)];
        case ChatRoomSummaryActionType.USERTUSERCHATROOM: return [...handleUpdateUserChatRoom(action.payload, state)];
        case ChatRoomSummaryActionType.RemoveUserFromGroupChat: return [...handleRemoveUserFromGroupChat(state, action.payload)]
        case ChatRoomSummaryActionType.AddMembersToChatRoom: return [...handleAddMembersToChatRoom(state, action.payload)]
        case ChatRoomSummaryActionType.UpdateChatRoomName: return [...handleUpdateChatRoomName(state, action.payload)]
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

function handleUpdateUserChatRoom(userChatRoom: UserChatRoom, state: ChatRoomSummary[]) {
    state.map(crs => {
        if (crs.chatRoom.id === userChatRoom.chatRoomId) {
            crs.userChatRoom = userChatRoom
            return {...crs};
        }
        return crs;
    })
    return state;
}

function handleUpdateChatRoomName(state: ChatRoomSummary[], request: ChatRoomIdAndName) {
    const newState = [...state.map(crs => {
        if (crs.chatRoom.id === request.chatRoomId) {
            crs.chatRoom.name = request.name;
            return { ...crs };
        }
        return {...crs};
    })]
    return newState;
}


function handeUpsertChatRoom(state: ChatRoomSummary[], payload: ChatRoomSummary) {
    let chatRoomExists = false;
    state.map(crSummary => {
        if (crSummary.chatRoom.id === payload.chatRoom.id) {
            chatRoomExists = true;
            return payload
        }
        else { return crSummary }
    })

    if (!chatRoomExists) {
        state.push(payload);
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

    useEffect(() => {
        const abortController = new AbortController();
        getChatRoomSummaries();
        getUserRelationships();
        async function getChatRoomSummaries() {
            try {
                const chatRoomSummariesResponse = await ChatRoomAPI.getUserChatRooms(abortController);
                if (chatRoomSummariesResponse != null && chatRoomSummariesResponse.data.length > 0) {
                    console.log(chatRoomSummariesResponse.data);
                    dispatchChatRoomSummary({ type: ChatRoomSummaryActionType.FIRSTGET, payload: chatRoomSummariesResponse.data })
                }
            } catch (err) {
                console.error(err);
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
        return () => {
            abortController.abort();
        }

    }, [])

    useEffect(() => {
        if (connection) {

            connection.on(ChatRoomSummaryConnectionFunction.RemoveUserFromGroupChat, (request: ChatRoomIdAndUserId) => {
                dispatchChatRoomSummary({ type: ChatRoomSummaryActionType.RemoveUserFromGroupChat, payload: request })
            })


            connection.on(ChatRoomSummaryConnectionFunction.AddMembersToChatRoom, (request: ChatRoomIdAndUsers) => {
                dispatchChatRoomSummary({ type: ChatRoomSummaryActionType.AddMembersToChatRoom, payload: request })
            })
            connection.on(ConnectionFunction.ReceivedChatRoom, (newChatRoomSummary: ChatRoomSummary) => {
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

        }

    }, [connection])

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
        <ChatRoomSummaryContextProvider.Provider value={{ chatRoomSummaries, dispatchChatRoomSummary, relationships, setRelationships }}>{children}</ChatRoomSummaryContextProvider.Provider>
    )
}

export default ChatRoomSummaryContext;

type ChatRoomSummaryContextValue = {
    chatRoomSummaries: ChatRoomSummary[];
    dispatchChatRoomSummary: React.Dispatch<ChatRoomSummaryAction>,
    relationships: UserRelationship[],
    setRelationships: React.Dispatch<React.SetStateAction<UserRelationship[]>>
}