import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import sessionReducer from './slices/sessionSlice';
import curriculumReducer from './slices/curriculumSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        session: sessionReducer,
        curriculum: curriculumReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
