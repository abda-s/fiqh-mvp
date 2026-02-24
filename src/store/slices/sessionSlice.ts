import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Exercise {
    id: number;
    level_id: number;
    type: 'multiple_choice' | 'ordering' | 'matching' | 'true_false';
    content_json: string;
    correct_answer: string;
}

export interface SessionState {
    isActive: boolean;
    currentLevelId: number | null;
    exercises: Exercise[];
    currentExerciseIndex: number;
    correctAnswers: number;
    sessionXP: number;
}

const initialState: SessionState = {
    isActive: false,
    currentLevelId: null,
    exercises: [],
    currentExerciseIndex: 0,
    correctAnswers: 0,
    sessionXP: 0,
};

const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        startSession: (state, action: PayloadAction<{ levelId: number; exercises: Exercise[] }>) => {
            state.isActive = true;
            state.currentLevelId = action.payload.levelId;
            state.exercises = action.payload.exercises;
            state.currentExerciseIndex = 0;
            state.correctAnswers = 0;
            state.sessionXP = 0;
        },
        nextExercise: (state) => {
            if (state.currentExerciseIndex < state.exercises.length - 1) {
                state.currentExerciseIndex += 1;
            }
        },
        recordCorrectAnswer: (state, action: PayloadAction<number>) => {
            state.correctAnswers += 1;
            state.sessionXP += action.payload; // XP to add
        },
        endSession: (state) => {
            state.isActive = false;
            // We don't reset levelId and summary stats immediately so the UI can display a summary screen
        },
        resetSession: () => initialState,
    },
});

export const { startSession, nextExercise, recordCorrectAnswer, endSession, resetSession } = sessionSlice.actions;
export default sessionSlice.reducer;
