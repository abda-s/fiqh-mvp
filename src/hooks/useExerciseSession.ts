import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { nextExercise, recordCorrectAnswer, completeSession, resetSession, loadExercisesForSession, processExerciseAnswer, Exercise } from '../store/slices/sessionSlice';
import { deductHeart, addXP } from '../store/slices/userSlice';
import { playSuccessHaptic, playErrorHaptic } from '../utils/haptics';
import { triggerShakeAnimation } from '../utils/animations';
import { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

export function useExerciseSession(levelId: number, isPractice: boolean, onComplete: () => void, goBack: () => void) {
    const dispatch = useDispatch<AppDispatch>();
    const { isActive, exercises, currentExerciseIndex, loadingExercises } = useSelector((state: RootState) => state.session);
    const hearts = useSelector((state: RootState) => state.user.hearts);
    const { t } = useTranslation();

    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

    const shakeAnimation = useSharedValue(0);

    const isProcessingRef = useRef(false);
    const hasFinishedRef = useRef(false);

    useEffect(() => {
        const load = async () => {
            const resultAction = await dispatch(loadExercisesForSession({ levelId, isPractice: !!isPractice }));
            if (loadExercisesForSession.fulfilled.match(resultAction)) {
                if (resultAction.payload.exercises.length === 0 && isPractice) {
                    Alert.alert(t('review.lessonsReady'), "0", [{ text: t('common.back'), onPress: goBack }]);
                }
            }
        };
        load();

        return () => {
            dispatch(resetSession());
        };
    }, [levelId, isPractice, dispatch, goBack, t]);

    const currentExercise = exercises[currentExerciseIndex] as Exercise;

    const handleAnswerSubmit = async (answer: string) => {
        if (!currentExercise || isAnswerRevealed || isProcessingRef.current) return;
        isProcessingRef.current = true;
        setSelectedAnswer(answer);

        const isCorrect = answer === currentExercise.correct_answer;

        if (isCorrect) {
            playSuccessHaptic();

            let quality = 5;

            dispatch(processExerciseAnswer({ exerciseId: currentExercise.id, quality, isPractice: !!isPractice }));
            dispatch(recordCorrectAnswer(10));
            dispatch(addXP(10));

            setTimeout(() => {
                proceedToNext();
            }, 1000);
        } else {
            playErrorHaptic();
            triggerShakeAnimation(shakeAnimation);

            setIsAnswerRevealed(true);

            dispatch(processExerciseAnswer({ exerciseId: currentExercise.id, quality: 1, isPractice: !!isPractice }));

            if (!isPractice) {
                dispatch(deductHeart());

                if (hearts - 1 <= 0) {
                    setTimeout(() => {
                        Alert.alert(t('exercise.gameOverTitle'), t('exercise.gameOverDesc'), [
                            { text: t('common.back'), onPress: goBack }
                        ]);
                    }, 500);
                    return;
                }
            }
            isProcessingRef.current = false;
        }
    };

    const proceedToNext = () => {
        if (hasFinishedRef.current) return;

        isProcessingRef.current = false;
        setSelectedAnswer(null);
        setIsAnswerRevealed(false);
        if (currentExerciseIndex < exercises.length - 1) {
            dispatch(nextExercise());
        } else {
            hasFinishedRef.current = true;
            dispatch(completeSession());
            const title = isPractice ? t('review.title') : t('common.continue');
            const message = isPractice ? "Review Complete!" : "You finished all exercises in this level.";
            Alert.alert(title, message, [
                {
                    text: "Awesome",
                    onPress: onComplete
                }
            ]);
        }
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: shakeAnimation.value }],
        };
    });

    return {
        isActive,
        loadingExercises,
        exercises,
        currentExerciseIndex,
        currentExercise,
        hearts,
        selectedAnswer,
        isAnswerRevealed,
        handleAnswerSubmit,
        proceedToNext,
        animatedStyle
    };
}
