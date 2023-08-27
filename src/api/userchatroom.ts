import { myAxios } from '.';
import { AddMembersToChatGroup, RemoveFromGroupChat, SetMutedDTO, UpdateLastMessageRead, UserChatRoom } from '@data-type';

const API_URL_USERCHATROOM = '/api/userchatrooms';

const UserChatRoomAPI = {
    updateUserChatRoomLastMessageRead: async function (userChatRoom: UpdateLastMessageRead) {
        return await myAxios().put(`${API_URL_USERCHATROOM}/${userChatRoom.id}`, JSON.stringify(userChatRoom));
    },
    setMuted: async function (request: SetMutedDTO) {
        const userChatRoomResponse = await myAxios().put<UserChatRoom>(`${API_URL_USERCHATROOM}/${request.id}/setmuted`, JSON.stringify(request));
        return userChatRoomResponse.data;
    },
    addMembersToChatGroup: async function (request: AddMembersToChatGroup) {

        return await myAxios().post(`${API_URL_USERCHATROOM}/addmembers`, JSON.stringify(request))
    },
    removeMemberFromGroupChat: async function (request: RemoveFromGroupChat) {
        return await myAxios().put(`${API_URL_USERCHATROOM}/removefromgroupchat`, JSON.stringify(request))
    },
    leavechatroom: async function (userChatRoomId: string) {
        return await myAxios().put(`${API_URL_USERCHATROOM}/${userChatRoomId}/leavechatroom`);
    }
}
export default UserChatRoomAPI;