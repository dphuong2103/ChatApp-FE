import { myAxios } from '.';
import { Message, NewMessage } from '../types/dataType';

const API_URL_MESSAGE = '/api/messages';

const MessageAPI = {
    getMessagesByChatRoomId: function (chatRoomId: string) {
        return myAxios().get<Message[]>(`${API_URL_MESSAGE}/chatroom/${chatRoomId}`);
    },
    addMessage: function (message: NewMessage) {
        return myAxios().post<Message>(API_URL_MESSAGE, JSON.stringify(message))
    },
    getMessagesPageByChatRoomId: function (chatRoomId: string, pageSize?: number, lastMessageId?: string) {
        const url = `${API_URL_MESSAGE}/filter?chatroomid=${chatRoomId}${pageSize ? `&pagesize=${pageSize}` : ''}${lastMessageId ? `&lastmessageid=${lastMessageId}` : ''}`;
        return myAxios().get<Message[]>(url);
    },
    setDeleteMessage: function (messageId: string) {
        const url = `${API_URL_MESSAGE}/delete/${messageId}`
        return myAxios().put<Message | null>(url);
    }
}
export default MessageAPI;