import { myAxios } from '.';
import { Message, NewMessage, NewMessageForAudioRecord, NewMessageForFileUpload } from '@data-type';
import { getChatRoomFileRef } from '../firebase/firebase-config';
import { getBlob, getMetadata } from 'firebase/storage';
const API_URL_MESSAGE = '/api/messages';


const MessageAPI = {
    getMessagesByChatRoomId: async function (chatRoomId: string) {
        const messagesResponse = await myAxios().get<Message[]>(`${API_URL_MESSAGE}/chatroom/${chatRoomId}`);
        return messagesResponse.data;
    },
    addMessage: async function (message: NewMessage) {
        const messageResponse = await myAxios().post<Message>(API_URL_MESSAGE, JSON.stringify(message));
        return messageResponse.data;
    },
    getMessagesPageByChatRoomId: async function (chatRoomId: string, pageSize?: number, lastMessageId?: string) {
        const url = `${API_URL_MESSAGE}/filter?chatroomid=${chatRoomId}${pageSize ? `&pagesize=${pageSize}` : ''}${lastMessageId ? `&lastmessageid=${lastMessageId}` : ''}`;
        const messagesResponse = await myAxios().get<Message[]>(url);
        return messagesResponse.data;
    },
    setDeleteMessage: async function (messageId: string) {
        const url = `${API_URL_MESSAGE}/delete/${messageId}`;
        const messagesResponse = await myAxios().put<Message | null>(url)
        return messagesResponse.data;
    },
    addNewMessageForFileUpload: async function (request: NewMessageForFileUpload) {
        const url = `${API_URL_MESSAGE}/newfileupload`;
        const messageResponse = await myAxios().post<Message>(url, JSON.stringify(request));
        return messageResponse.data;

    },
    updateMessageOnFileUploadFinish: async function (messageId: string, fileUrls: string) {
        const url = `${API_URL_MESSAGE}/${messageId}/fileuploadfinished`;
        return await myAxios().put(url, JSON.stringify(fileUrls));
    },
    getMessageFileMetaData: async function (chatRoomId: string, messageId: string) {
        const fileRef = getChatRoomFileRef(chatRoomId, messageId)
        const metadata = await getMetadata(fileRef)
        return metadata
    },
    cancelUploadingMessageFile: async function (messageId: string) {
        return await myAxios().put(`${API_URL_MESSAGE}/${messageId}/canceluploadingmessagefile`);
    },
    getMissingMessages: async function (lastMessageId: string) {
        const messagesResponse = await myAxios().get<Message[]>(`${API_URL_MESSAGE}/${lastMessageId}/getmissingmessages`)
        return messagesResponse.data;
    },
    addNewMessageForAudioRecord: async function (request: NewMessageForAudioRecord) {
        const messageRespones = await myAxios().post<Message>(`${API_URL_MESSAGE}/addnewmessageforaudiorecord`, JSON.stringify(request))
        return messageRespones.data;
    },
    getAudioBlob: async function (chatRoomId: string, messageId: string) {
        const storageRef = getChatRoomFileRef(chatRoomId, messageId);
        return await getBlob(storageRef);
    },
    uploadFileMessageError: async function (messageId: string) {
        const messageResponse = await myAxios().put<Message>(`${API_URL_MESSAGE}/${messageId}/uploadfilemessageerror`)
        return messageResponse.data;
    }
}
export default MessageAPI;

