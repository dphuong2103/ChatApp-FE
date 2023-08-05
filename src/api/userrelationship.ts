import { UserRelationship, NewUserRelationship } from './../types/dataType';
import myAxios from './config';
import store from '../redux/store';
const API_URL_USERRELATIONSHIP = '/api/userrelationships'

export const UserRelationshipAPI = {
    addUserRelationship: function (newUserRelationship: NewUserRelationship, abortController?: AbortController) {
        return myAxios(abortController).post(`${API_URL_USERRELATIONSHIP}`, JSON.stringify(newUserRelationship));
    },
    updateUserRelationship: function (request: UserRelationship, abortController?: AbortController) {
        return myAxios(abortController).put(`${API_URL_USERRELATIONSHIP}/${request.id}`, JSON.stringify(request))
    },
    getUserRelationship: function (abortController?: AbortController) {
        const useSelector = store.getState();
        const userId = useSelector.auth.user?.id;
        if (!userId) return null;
        return myAxios(abortController).get<UserRelationship[]>(`${API_URL_USERRELATIONSHIP}/userid/${userId}`);
    },
    sendFriendRequest: function (initiatorUserId: string, targetUserId: string, abortController?: AbortController) {
        const request: NewUserRelationship = {
            initiatorUserId: initiatorUserId,
            targetUserId: targetUserId,
            relationshipType: 'E_FRIEND',
            status: 'E_PENDING'
        }
        return UserRelationshipAPI.addUserRelationship(request, abortController);
    },
    cancelFriendRequest: function (relationshipId: string, abortController?: AbortController) {
        return myAxios(abortController).delete(`${API_URL_USERRELATIONSHIP}/${relationshipId}`);
    },
    acceptFriendRequest: function (relationship: UserRelationship, abortController?: AbortController) {
        relationship.status = 'E_ACCEPTED';
        return myAxios(abortController).put(`${API_URL_USERRELATIONSHIP}/${relationship.id}/accept`, JSON.stringify(relationship));
    },
    deleteFriendRelationship: function (relationshipId: string) {
        return myAxios().delete(`${API_URL_USERRELATIONSHIP}/${relationshipId}`);
    }
};
