import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import sessionReducer from './slices/sessionSlice';
import curriculumReducer from './slices/curriculumSlice';
import { dbMiddleware } from './middleware/dbMiddleware';

export const store = configureStore({
    reducer: {
        user: userReducer,
        session: sessionReducer,
        curriculum: curriculumReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(dbMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
