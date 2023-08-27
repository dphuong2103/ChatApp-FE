import { UserRelationship, NewUserRelationship } from '@data-type';
import myAxios from './config';
import store from '../redux/store';
const API_URL_USERRELATIONSHIP = '/api/userrelationships'

export const UserRelationshipAPI = {
    addUserRelationship: async function (newUserRelationship: NewUserRelationship, abortController?: AbortController) {
        return await myAxios(abortController).post(`${API_URL_USERRELATIONSHIP}`, JSON.stringify(newUserRelationship));
    },
    updateUserRelationship: async function (request: UserRelationship, abortController?: AbortController) {
        return await myAxios(abortController).put(`${API_URL_USERRELATIONSHIP}/${request.id}`, JSON.stringify(request))
    },
    getUserRelationship: async function (abortController?: AbortController) {
        const useSelector = store.getState();
        const userId = useSelector.auth.user?.id;
        if (!userId) return null;
        const userRelationshipsResponse = await myAxios(abortController).get<UserRelationship[]>(`${API_URL_USERRELATIONSHIP}/userid/${userId}`)
        return userRelationshipsResponse.data;
    },

    sendFriendRequest: async function (initiatorUserId: string, targetUserId: string, abortController?: AbortController) {
        const request: NewUserRelationship = {
            initiatorUserId: initiatorUserId,
            targetUserId: targetUserId,
            relationshipType: 'E_FRIEND',
            status: 'E_PENDING'
        }
        return await UserRelationshipAPI.addUserRelationship(request, abortController);
    },
    cancelFriendRequest: async function (relationshipId: string, abortController?: AbortController) {
        return await myAxios(abortController).delete(`${API_URL_USERRELATIONSHIP}/${relationshipId}`);
    },
    acceptFriendRequest: async function (relationship: UserRelationship, abortController?: AbortController) {
        relationship.status = 'E_ACCEPTED';
        return await myAxios(abortController).put(`${API_URL_USERRELATIONSHIP}/${relationship.id}/accept`, JSON.stringify(relationship));
    },
    deleteFriendRelationship: async function (relationshipId: string) {
        return await myAxios().delete(`${API_URL_USERRELATIONSHIP}/${relationshipId}`);
    }
};
