import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { nextExercise, recordCorrectAnswer, completeSession, resetSession, Exercise, loadExercisesForSession, processExerciseAnswer } from '../store/slices/sessionSlice';
import { deductHeart, addXP } from '../store/slices/userSlice';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { playSuccessHaptic, playErrorHaptic } from '../utils/haptics';
import { triggerShakeAnimation } from '../utils/animations';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { HeartIcon } from '../components/CustomIcons';
import { useTranslation } from 'react-i18next';
import { AppText } from '../components/AppText';

type ExerciseScreenProps = NativeStackScreenProps<RootStackParamList, 'Exercise'>;


export default function ExerciseScreen({ route, navigation }: ExerciseScreenProps) {
    const { levelId, isPractice } = route.params;
    const dispatch = useDispatch<AppDispatch>();

    const { isActive, exercises, currentExerciseIndex, loadingExercises } = useSelector((state: RootState) => state.session);
    const hearts = useSelector((state: RootState) => state.user.hearts);
    const { t } = useTranslation();

    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

    const shakeAnimation = useSharedValue(0);

    useEffect(() => {
        const load = async () => {
            const resultAction = await dispatch(loadExercisesForSession({ levelId, isPractice: !!isPractice }));
            if (loadExercisesForSession.fulfilled.match(resultAction)) {
                if (resultAction.payload.exercises.length === 0 && isPractice) {
                    Alert.alert(t('review.lessonsReady'), "0", [{ text: t('common.back'), onPress: () => navigation.goBack() }]);
                }
            }
        };
        load();

        return () => {
            dispatch(resetSession());
        };
    }, [levelId, isPractice, dispatch]);

    const currentExercise = exercises[currentExerciseIndex];

    const handleAnswerSubmit = async (answer: string) => {
        if (!currentExercise || isAnswerRevealed) return;
        setSelectedAnswer(answer);

        const isCorrect = answer === currentExercise.correct_answer;

        if (isCorrect) {
            playSuccessHaptic();

            // First try correct
            let quality = 5;

            // Update SRS
            dispatch(processExerciseAnswer({ exerciseId: currentExercise.id, quality, isPractice: !!isPractice }));
            dispatch(recordCorrectAnswer(10)); // Reward 10 XP per question
            dispatch(addXP(10)); // Update global user stats immediately (MVP scope)

            setTimeout(() => {
                proceedToNext();
            }, 1000);
        } else {
            playErrorHaptic();
            triggerShakeAnimation(shakeAnimation);

            // Immediately reveal the incorrect state 
            setIsAnswerRevealed(true);

            // Dispatch failed answer so supermemo2 can flag isRepeatAgain
            dispatch(processExerciseAnswer({ exerciseId: currentExercise.id, quality: 1, isPractice: !!isPractice }));

            if (!isPractice) {
                dispatch(deductHeart());

                if (hearts - 1 <= 0) {
                    setTimeout(() => {
                        Alert.alert(t('exercise.gameOverTitle'), t('exercise.gameOverDesc'), [
                            { text: t('common.back'), onPress: () => navigation.goBack() }
                        ]);
                    }, 500);
                    return;
                }
            }
        }
    };

    const proceedToNext = () => {
        setSelectedAnswer(null);
        setIsAnswerRevealed(false);
        if (currentExerciseIndex < exercises.length - 1) {
            dispatch(nextExercise());
        } else {
            // End of Lesson
            dispatch(completeSession());
            const title = isPractice ? t('review.title') : t('common.continue');
            const message = isPractice ? "Review Complete!" : "You finished all exercises in this level.";
            Alert.alert(title, message, [
                {
                    text: "Awesome",
                    onPress: () => {
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            // @ts-ignore - Route params definition might be strict, fallback gracefully
                            navigation.replace('MainTabs');
                        }
                    }
                }
            ]);
            // Persistence to user_progress handled cleanly by middleware.
        }
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: shakeAnimation.value }],
        };
    });

    if (loadingExercises || !isActive) {
        return <View style={styles.container}><AppText>Loading Exercises...</AppText></View>;
    }

    if (!currentExercise) {
        return <View style={styles.container}><AppText>No exercises found for this level.</AppText></View>;
    }

    const content = JSON.parse(currentExercise.content_json);

    const getOptionStyle = (opt: string) => {
        // Always highlight the correct answer in green if the answer is revealed
        if (isAnswerRevealed && opt === currentExercise?.correct_answer) {
            return [styles.optionButton, styles.correctOption];
        }

        if (selectedAnswer !== opt) return styles.optionButton;
        if (selectedAnswer === currentExercise.correct_answer) {
            return [styles.optionButton, styles.correctOption];
        }
        return [styles.optionButton, styles.wrongOption];
    };

    const renderOptions = () => {
        if (currentExercise.type === 'true_false') {
            return (
                <View style={styles.optionsContainer}>
                    <TouchableOpacity
                        style={getOptionStyle('true')}
                        disabled={isAnswerRevealed}
                        onPress={() => handleAnswerSubmit('true')}
                    >
                        <AppText style={styles.optionText} variant="h3">{t('common.true')}</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={getOptionStyle('false')}
                        disabled={isAnswerRevealed}
                        onPress={() => handleAnswerSubmit('false')}
                    >
                        <AppText style={styles.optionText} variant="h3">{t('common.false')}</AppText>
                    </TouchableOpacity>
                </View>
            );
        }

        if (currentExercise.type === 'multiple_choice') {
            return (
                <View style={styles.optionsContainer}>
                    {content.options.map((opt: string, idx: number) => (
                        <TouchableOpacity
                            key={idx}
                            style={getOptionStyle(opt)}
                            disabled={isAnswerRevealed}
                            onPress={() => handleAnswerSubmit(opt)}
                        >
                            <AppText style={styles.optionText} variant="h3">{opt}</AppText>
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }

        // fallback for 'ordering' types on MVP
        return (
            <View style={styles.optionsContainer}>
                <AppText style={styles.comingSoon} variant="bodySmall">This exercise type ({currentExercise.type}) is under construction for MVP.</AppText>
                <TouchableOpacity style={styles.optionButton} disabled={isAnswerRevealed} onPress={() => handleAnswerSubmit(currentExercise.correct_answer)}>
                    <AppText style={styles.optionText} variant="h3">Skip / Auto-Correct</AppText>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <MaterialCommunityIcons name="close" size={28} color={theme.colors.textMuted} />
                </TouchableOpacity>
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${(currentExerciseIndex / exercises.length) * 100}%` as any }]} />
                </View>
                <View style={styles.heartBox}>
                    {isPractice ? (
                        <AppText style={styles.heartText} variant="h3">{t('exercise.practiceLabel')}</AppText>
                    ) : (
                        <>
                            <HeartIcon size={24} color={theme.colors.danger} fill={theme.colors.danger} />
                            <AppText style={styles.heartText} variant="h3">{hearts}</AppText>
                        </>
                    )}
                </View>
            </View>

            <Animated.View style={[styles.questionArea, animatedStyle]}>
                <AppText style={styles.questionLabel} variant="h3">{t('exercise.questionLabel')}</AppText>
                <AppText style={styles.questionText} variant="h1">{content.question}</AppText>
            </Animated.View>

            {renderOptions()}

            <View style={styles.bottomBar}>
                {isAnswerRevealed ? (
                    <TouchableOpacity
                        style={[styles.checkButton, { backgroundColor: theme.colors.danger }]}
                        activeOpacity={0.8}
                        onPress={proceedToNext}
                    >
                        <AppText style={styles.checkButtonText} variant="h3">{t('common.continue')}</AppText>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.checkButton, !selectedAnswer && styles.checkButtonDisabled]}
                        disabled={!selectedAnswer}
                        activeOpacity={0.8}
                        onPress={() => selectedAnswer && handleAnswerSubmit(selectedAnswer)}
                    >
                        <AppText style={styles.checkButtonText} variant="h3">{t('common.check')}</AppText>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    closeBtn: {
        padding: 5,
    },
    progressContainer: {
        flex: 1,
        height: 16,
        backgroundColor: theme.colors.border,
        borderRadius: 8,
        marginHorizontal: 15,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: theme.colors.success,
        borderRadius: 8,
    },
    heartBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    heartText: {
        color: theme.colors.danger,
    },
    questionArea: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
    },
    questionLabel: {
        color: theme.colors.textMuted,
        marginBottom: 10,
    },
    questionText: {
        color: theme.colors.textMain,
        lineHeight: 36,
    },
    optionsContainer: {
        flex: 1.5,
        paddingHorizontal: 20,
        justifyContent: 'flex-start',
        gap: 12,
    },
    optionButton: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 2,
        borderBottomWidth: 4, // 3D effect
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    correctOption: {
        backgroundColor: theme.colors.successLight,
        borderColor: theme.colors.success,
    },
    wrongOption: {
        backgroundColor: theme.colors.dangerLight,
        borderColor: theme.colors.danger,
    },
    optionText: {
        color: theme.colors.textMain,
    },
    comingSoon: {
        textAlign: 'center',
        marginBottom: 20,
    },
    bottomBar: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        paddingBottom: 40, // For bottom safe area
    },
    checkButton: {
        backgroundColor: theme.colors.success,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    checkButtonDisabled: {
        backgroundColor: theme.colors.border,
    },
    checkButtonText: {
        color: theme.colors.surface,
        letterSpacing: 1,
    }
});
