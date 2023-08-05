import { createSlice } from '@reduxjs/toolkit';

const loadingSpinnerSlice = createSlice({
    name: 'loadingSpinner',
    initialState: false,
    reducers: {
        showLoadingSpinner: (state) => {
            state = true;
            return state;
        },
        closeLoadingSpinner: (state) => {
            state = false;
            return state;
        }
    }
});

export default loadingSpinnerSlice.reducer;
export const { showLoadingSpinner, closeLoadingSpinner } = loadingSpinnerSlice.actions;