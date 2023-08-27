import { ChatRoomIdAndImageUrl } from '@data-type';
import { myAxios } from '.';
import { ChatRoomIdAndName, ChatRoomSummary, NewChatRoomAndUserList } from '@data-type';
import store from '../redux/store';
import { chatRoomAvatarRef } from '../firebase/firebase-config';
import { getDownloadURL, uploadString } from 'firebase/storage';

const API_URL_CHATROOM = '/api/chatrooms';

const ChatRoomAPI = {
    getUserChatRooms: async function (abortController?: AbortController) {
        const useSelector = store.getState();
        const userId = useSelector.auth.user?.id;
        if (!userId) return null;
        const chatRoomSummariesResponse = await myAxios(abortController).get<ChatRoomSummary[]>(`${API_URL_CHATROOM}/user/${userId}`);
        return chatRoomSummariesResponse.data
    },
    addNewChatRoom: async function (newChatRoomAndUserList: NewChatRoomAndUserList, abortController?: AbortController) {
        const chatRoomSummaryResponse = await myAxios(abortController).post<ChatRoomSummary>(`${API_URL_CHATROOM}`, JSON.stringify(newChatRoomAndUserList));
        return chatRoomSummaryResponse.data;
    },
    addNewChatRoomGroup: async function (newChatRoomAndUserList: NewChatRoomAndUserList) {
        return myAxios().post<ChatRoomSummary>(`${API_URL_CHATROOM}/newchatgroup`, JSON.stringify(newChatRoomAndUserList))
    },
    updateChatRoomName: async function (request: ChatRoomIdAndName) {
        return await myAxios().put(`${API_URL_CHATROOM}/${request.chatRoomId}/updatechatname`, JSON.stringify(request));
    },
    uploadChatRoomAvatar: async function (chatRoomId: string, image: string) {
        const imageRef = chatRoomAvatarRef(chatRoomId);
        const url = await getDownloadURL((await uploadString(imageRef, image, 'base64')).ref);
        const chatRoomIdAndImageUrl: ChatRoomIdAndImageUrl = {
            chatRoomId: chatRoomId,
            photoUrl: url
        }
        return await myAxios().put(`${API_URL_CHATROOM}/${chatRoomId}/updatechatroomavatar`, JSON.stringify(chatRoomIdAndImageUrl));
    },
    getChatRoomAvatar: async function (chatRoomId: string) {
        const imageRef = chatRoomAvatarRef(chatRoomId);
        return await getDownloadURL(imageRef);
    },

}
export default ChatRoomAPI;
