import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import loadingSpinnerReducer from './slices/loadingSpinner';
const store = configureStore({
  reducer: {
    auth: authReducer,
    loadingSpinner: loadingSpinnerReducer,
  },
});
export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type DispatchFunc = () => AppDispatch;
export const useAppDispatch: DispatchFunc = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
