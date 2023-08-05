import { myAxios } from '.';
import { ChatRoomIdAndName, ChatRoomSummary, NewChatRoomAndUserList } from '../types/dataType';
import store from '../redux/store';

const API_URL_CHATROOM = '/api/chatrooms';

const ChatRoomAPI = {
    getUserChatRooms: function (abortController?: AbortController) {
        const useSelector = store.getState();
        const userId = useSelector.auth.user?.id;
        if (!userId) return null;
        return myAxios(abortController).get<ChatRoomSummary[]>(`${API_URL_CHATROOM}/user/${userId}`)
    },
    addNewChatRoom: function (newChatRoomAndUserList: NewChatRoomAndUserList, abortController?: AbortController) {
        return myAxios(abortController).post<ChatRoomSummary>(`${API_URL_CHATROOM}`, JSON.stringify(newChatRoomAndUserList))
    },
    addNewChatRoomGroup: function (newChatRoomAndUserList: NewChatRoomAndUserList) {
        return myAxios().post<ChatRoomSummary>(`${API_URL_CHATROOM}/newchatgroup`, JSON.stringify(newChatRoomAndUserList))
    },
    updateChatRoomName: function (request: ChatRoomIdAndName) {
        return myAxios().put(`${API_URL_CHATROOM}/${request.chatRoomId}/updatechatname`, JSON.stringify(request));
    }
}
export default ChatRoomAPI;
