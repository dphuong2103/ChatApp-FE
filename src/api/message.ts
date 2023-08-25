import { myAxios } from '.';
import { Message, NewMessage, NewMessageForAudioRecord, NewMessageForFileUpload } from '@data-type';
import { getChatRoomFileRef } from '../firebase/firebase-config';
import { getBlob, getMetadata } from 'firebase/storage';
const API_URL_MESSAGE = '/api/messages';


const MessageAPI = {
    getMessagesByChatRoomId: function (chatRoomId: string) {
        return myAxios().get<Message[]>(`${API_URL_MESSAGE}/chatroom/${chatRoomId}`);
    },
    addMessage: function (message: NewMessage) {
        return myAxios().post<Message>(API_URL_MESSAGE, JSON.stringify(message));
    },
    getMessagesPageByChatRoomId: function (chatRoomId: string, pageSize?: number, lastMessageId?: string) {
        const url = `${API_URL_MESSAGE}/filter?chatroomid=${chatRoomId}${pageSize ? `&pagesize=${pageSize}` : ''}${lastMessageId ? `&lastmessageid=${lastMessageId}` : ''}`;
        return myAxios().get<Message[]>(url);
    },
    setDeleteMessage: function (messageId: string) {
        const url = `${API_URL_MESSAGE}/delete/${messageId}`;
        return myAxios().put<Message | null>(url);
    },
    addNewMessageForFileUpload: function (request: NewMessageForFileUpload) {
        const url = `${API_URL_MESSAGE}/newfileupload`;
        return myAxios().post<Message>(url, JSON.stringify(request));
    },
    updateMessageOnFileUploadFinish: function (messageId: string, fileUrls: string) {
        const url = `${API_URL_MESSAGE}/${messageId}/fileuploadfinished`;
        return myAxios().put(url, JSON.stringify(fileUrls));
    },
    getMessageFileMetaData: async function (chatRoomId: string, messageId: string) {
        const fileRef = getChatRoomFileRef(chatRoomId, messageId)
        const metadata = await getMetadata(fileRef)
        return metadata
    },
    cancelUploadingMessageFile(messageId: string) {
        return myAxios().put(`${API_URL_MESSAGE}/${messageId}/canceluploadingmessagefile`);
    },
    getMissingMessages(lastMessageId: string) {
        return myAxios().get<Message[]>(`${API_URL_MESSAGE}/${lastMessageId}/getmissingmessages`);
    },
    addNewMessageForAudioRecord: function (request: NewMessageForAudioRecord) {
        return myAxios().post<Message>(`${API_URL_MESSAGE}/addnewmessageforaudiorecord`, JSON.stringify(request));
    },
    getAudioBlob: function (chatRoomId: string, messageId: string) {
        const storageRef = getChatRoomFileRef(chatRoomId, messageId);
        return getBlob(storageRef);
    },
    uploadFileMessageError: function (messageId: string) {
        return myAxios().put<Message>(`${API_URL_MESSAGE}/${messageId}/uploadfilemessageerror`)
    }
}
export default MessageAPI;

