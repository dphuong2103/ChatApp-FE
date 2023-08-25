import { Dispatch, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { User } from '@data-type';
import {
  createUserWithEmailAndPassword,
  firebaseLogOut,
  signInWithEmailAndPassword,
  signInWithGoogle,
  updateFirebaseUserInfo,
  updateGoogleUserDisplayName,
} from '../../firebase-config';
import { convertGoogleUserToUser } from '@helper/helper';
import { toast } from 'react-toastify';
import { UserSignUpForm } from '../../pages/auth/SignUp';
import { UserAPI } from '@api';
type AuthSliceType = {
  user: User | null;
  isLoggedIn: boolean;
};

function getUserFromLocalStorage() {
  const authJson = localStorage.getItem('auth');
  if (authJson == null) return null;
  const auth = JSON.parse(authJson) as AuthSliceType;
  return auth;
}

const initialState: AuthSliceType = getUserFromLocalStorage() || {
  isLoggedIn: false,
  user: null,
};


const authSlice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {
    logIn: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      localStorage.setItem('auth', JSON.stringify(state));
    },
    logOut: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      localStorage.removeItem('auth');
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('auth', JSON.stringify(state));
    }
  },
});


export function loginWithEmailAndPassword(email: string, password: string) {
  return async (dispatch: Dispatch) => {
    const googleUser = await signInWithEmailAndPassword(email, password);
    const userResponse = await UserAPI.getUserById(googleUser.user.uid);
    if (userResponse.data != null) {
      dispatch(authSlice.actions.logIn(userResponse.data));
    }
  };
}

export function signUpWithEmailAndPassword(userSignUp: UserSignUpForm) {
  return async (dispatch: Dispatch) => {
    const googleUser = await createUserWithEmailAndPassword(userSignUp.email, userSignUp.password);
    await updateGoogleUserDisplayName(userSignUp.displayName);
    const user = await convertGoogleUserToUser(googleUser);
    if (user != null) {
      await UserAPI.addUser(user);
      dispatch(authSlice.actions.logIn(user));
    }
  };
}

export function googleSignIn() {
  return async (dispatch: Dispatch) => {
    const googleUser = await signInWithGoogle();
    const user = await convertGoogleUserToUser(googleUser);
    if (user != null) {
      await UserAPI.addGoogleUser(user);
      dispatch(authSlice.actions.logIn(user));
    }
  };
}

export function logOut(showNotify?: boolean) {
  return async (dispatch: Dispatch) => {
    await firebaseLogOut();
    dispatch(authSlice.actions.logOut());
    showNotify && toast.info('Logged out successfully!');
  };
}

export function updateUserProfile(user: User) {
  return async (dispatch: Dispatch) => {
    await UserAPI.updateUser(user);
    await updateFirebaseUserInfo({ displayName: user.displayName, photoURL: user.photoUrl });
    dispatch(authSlice.actions.updateUser(user));
  }
}

export default authSlice.reducer;
