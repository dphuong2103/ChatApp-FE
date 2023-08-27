
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { User } from '@data-type';
import myAxios from './config';
import { storage } from '../firebase/firebase-config';

const API_URL_USER = '/api/users'
const API_URL_SEARCH = `${API_URL_USER}/search`;

export const UserAPI = {
    addUser: async function (user: User, abortController?: AbortController) {
        const userResponse = await myAxios(abortController).post<User>(`${API_URL_USER}`, JSON.stringify(user))
        return userResponse.data;
    },
    updateUser: async function (user: User, abortController?: AbortController) {
        const userResponse = await myAxios(abortController).put<User>(`${API_URL_USER}/${user.id}`, JSON.stringify(user));
        userResponse.data;
    },
    searchUser: async function (filterValue: string, abortController?: AbortController) {
        const usersResponse = await myAxios(abortController).get<User[]>(`${API_URL_SEARCH}/${filterValue}`);
        return usersResponse.data;
    },
    uploadUserAvatar: async function (userId: string, image: string) {
        const imageRef = ref(storage, `images/useravatar/${userId}`)
        return await uploadString(imageRef, image, 'base64')
    },
    getUserAvatarUrl: async function (userId: string) {
        const imageRef = ref(storage, `images/useravatar/${userId}`);
        return await getDownloadURL(imageRef);
    },
    getUserById: async function (userId: string) {
        const userResponse = await myAxios().get<User>(`${API_URL_USER}/${userId}`)
        return userResponse.data;
    },
    addGoogleUser: async function (user: User, abortController?: AbortController) {
        const userResponse = await myAxios(abortController).post<User>(`${API_URL_USER}/google`, JSON.stringify(user));
        return userResponse.data;
    },
};
