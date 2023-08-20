import { myAxios } from '.';
import { AddMembersToChatGroup, RemoveFromGroupChat, SetMutedDTO, UpdateLastMessageRead, UserChatRoom } from '../types/dataType';

const API_URL_USERCHATROOM = '/api/userchatrooms';

const UserChatRoomAPI = {
    updateUserChatRoomLastMessageRead: function (userChatRoom: UpdateLastMessageRead) {
        return myAxios().put(`${API_URL_USERCHATROOM}/${userChatRoom.id}`, JSON.stringify(userChatRoom));
    },
    setMuted: function (request: SetMutedDTO) {
        return myAxios().put<UserChatRoom>(`${API_URL_USERCHATROOM}/${request.id}/setmuted`, JSON.stringify(request));
    },
    addMembersToChatGroup: function (request: AddMembersToChatGroup) {
        return myAxios().post(`${API_URL_USERCHATROOM}/addmembers`, JSON.stringify(request))
    },
    removeMemberFromGroupChat: function (request: RemoveFromGroupChat) {
        return myAxios().put(`${API_URL_USERCHATROOM}/removefromgroupchat`, JSON.stringify(request))
    },
    leavechatroom: function (userChatRoomId: string) {
        return myAxios().put(`${API_URL_USERCHATROOM}/${userChatRoomId}/leavechatroom`);
    }
}
export default UserChatRoomAPI;