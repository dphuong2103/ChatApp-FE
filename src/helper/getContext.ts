import { useContext } from 'react';
import { ChatRoomSummaryContextProvider } from '../context/ChatRoomSummaryContext';
import { CurrentChatRoomContext } from '../context/CurrentChatRoom';
import { HubConnectionContext } from '../context/HubConnection';
import { CallContext } from '../context/Call';
import { ChatMessageContext } from '../context/ChatMessageContext';

export const useHubConnection = () => useContext(HubConnectionContext)
export const useChatRoomSummaryContext = () => useContext(ChatRoomSummaryContextProvider)
export const useCallContext = () => useContext(CallContext);
export const useChatContext = () => useContext(ChatMessageContext);
export const useCurrentChatRoomContext = () => useContext(CurrentChatRoomContext);

