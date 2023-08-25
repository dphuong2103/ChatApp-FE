
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { User } from '@data-type';
import myAxios from './config';
import { storage } from '../firebase-config';

const API_URL_USER = '/api/users'
const API_URL_SEARCH = `${API_URL_USER}/search`;

export const UserAPI = {
    addUser: function (user: User, abortController?: AbortController) {
        return myAxios(abortController).post<User>(`${API_URL_USER}`, JSON.stringify(user));
    },
    updateUser: function (user: User, abortController?: AbortController) {
        return myAxios(abortController).put<User>(`${API_URL_USER}/${user.id}`, JSON.stringify(user));
    },
    searchUser: function (filterValue: string, abortController?: AbortController) {
        return myAxios(abortController).get<User[]>(`${API_URL_SEARCH}/${filterValue}`);
    },
    uploadUserAvatar: function (userId: string, image: string) {
        const imageRef = ref(storage, `images/useravatar/${userId}`)
        return uploadString(imageRef, image, 'base64')
    },
    getUserAvatarUrl: function (userId: string) {
        const imageRef = ref(storage, `images/useravatar/${userId}`);
        return getDownloadURL(imageRef);
    },
    getUserById: function (userId: string) {
        return myAxios().get<User>(`${API_URL_USER}/${userId}`);
    },
    addGoogleUser: function (user: User, abortController?: AbortController) {
        return myAxios(abortController).post<User>(`${API_URL_USER}/google`, JSON.stringify(user));
    },
};
