import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword as createUserWithEmail,
  signInWithEmailAndPassword as signInWithEmail,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { getStorage, ref } from "firebase/storage";
const firebaseConfig = {
  apiKey: 'AIzaSyAt-y2HeEl0hWLey_vDn6EJ9Mo0oqcFdC8',
  authDomain: 'chat-app-35d62.firebaseapp.com',
  projectId: 'chat-app-35d62',
  storageBucket: 'chat-app-35d62.appspot.com',
  messagingSenderId: '240654264877',
  appId: '1:240654264877:web:2c25093dce9df3bad8a6a4',
  measurementId: 'G-806DG99TS8',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

provider.setCustomParameters({ prompt: 'select_account' });

export function signInWithEmailAndPassword(email: string, password: string) {
  return signInWithEmail(auth, email, password);
}

export function createUserWithEmailAndPassword(
  email: string,
  password: string
) {
  return createUserWithEmail(auth, email, password);
}

export function signInWithGoogle() {
  return signInWithPopup(auth, provider);
}

export function requestResetPasswordByEmail(email: string) {
  return sendPasswordResetEmail(auth, email);
}
export function updateGoogleUserDisplayName(displayName: string) {
  return updateProfile(auth.currentUser!, {
    displayName
  });
}
type updateInfo = {
  displayName?: string | null
  photoURL?: string | null
}

export function updateFirebaseUserInfo(updateInfo: updateInfo) {
  return updateProfile(auth.currentUser!, updateInfo);
}

export const storage = getStorage(app);

const UserAvatarRef = 'images/useravatar';
export const userAvatarListRef = ref(storage, UserAvatarRef);

const PRD = 'prd';
const DEV = 'dev';
const chatRoomFileUrl = (chatRoomId: string, messageId: string) => `${import.meta.env.PROD ? PRD : DEV}/chatrooms/messagefiles/${chatRoomId}/${messageId}`

export const getChatRoomFileRef =
  (chatRoomId: string, messageId: string) => ref(storage, chatRoomFileUrl(chatRoomId, messageId))

const chatRoomAvatarUrl = (chatRoomId: string) => `${import.meta.env.PROD ? PRD : DEV}/images/chatroomavatar/${chatRoomId}`;

export const chatRoomAvatarRef = (chatRoomId: string) => ref(storage, chatRoomAvatarUrl(chatRoomId));

export const firebaseLogOut = () => auth.signOut();