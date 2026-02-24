import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, I18nManager } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { startSession, nextExercise, recordCorrectAnswer, endSession, resetSession, Exercise } from '../store/slices/sessionSlice';
import { deductHeart, addXP } from '../store/slices/userSlice';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { HeartIcon } from '../components/CustomIcons';
import { useTranslation } from 'react-i18next';
import { calculateSM2 } from '../utils/sm2';

type ExerciseScreenProps = NativeStackScreenProps<RootStackParamList, 'Exercise'>;

const isRTL = I18nManager.isRTL;

export default function ExerciseScreen({ route, navigation }: ExerciseScreenProps) {
    const { levelId, isPractice } = route.params;
    const db = useSQLiteContext();
    const dispatch = useDispatch();

    const { isActive, exercises, currentExerciseIndex } = useSelector((state: RootState) => state.session);
    const hearts = useSelector((state: RootState) => state.user.hearts);
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    const shakeAnimation = useSharedValue(0);

    useEffect(() => {
        loadExercises();
        return () => {
            dispatch(resetSession());
        };
    }, [levelId]);

    const loadExercises = async () => {
        try {
            let data: Exercise[] = [];

            if (isPractice) {
                // Fetch up to 10 pending SRS exercises
                data = await db.getAllAsync<Exercise>(`
                    SELECT e.* FROM exercises e
                    JOIN srs_reviews s ON e.id = s.exercise_id
                    WHERE s.next_review_date <= date('now', 'localtime')
                    ORDER BY s.next_review_date ASC
                    LIMIT 10
                `);
            } else {
                data = await db.getAllAsync<Exercise>(`SELECT * FROM exercises WHERE level_id = ?`, [levelId]);
            }

            if (data.length === 0) {
                setLoading(false);
                if (isPractice) {
                    Alert.alert(t('review.lessonsReady'), "0", [{ text: t('common.back'), onPress: () => navigation.goBack() }]);
                }
                return;
            }

            dispatch(startSession({ levelId, exercises: data }));
            setLoading(false);
        } catch (e) {
            console.error('Failed to load exercises:', e);
            setLoading(false);
        }
    };

    const currentExercise = exercises[currentExerciseIndex];

    const handleAnswerSubmit = async (answer: string) => {
        if (!currentExercise) return;
        setSelectedAnswer(answer);

        const isCorrect = answer === currentExercise.correct_answer;
        const quality = isCorrect ? 5 : 1;

        // Update SRS
        try {
            const existingReview = await db.getFirstAsync<{
                ease_factor: number;
                interval: number;
                repetitions: number;
            }>('SELECT ease_factor, interval, repetitions FROM srs_reviews WHERE exercise_id = ?', [currentExercise.id]);

            const ef = existingReview ? existingReview.ease_factor : 2.5;
            const iv = existingReview ? existingReview.interval : 0;
            const rep = existingReview ? existingReview.repetitions : 0;

            const nextData = calculateSM2(quality, rep, ef, iv);

            await db.runAsync(`
               INSERT INTO srs_reviews (exercise_id, ease_factor, interval, repetitions, next_review_date)
               VALUES (?, ?, ?, ?, ?)
               ON CONFLICT(exercise_id) DO UPDATE SET
                 ease_factor = excluded.ease_factor,
                 interval = excluded.interval,
                 repetitions = excluded.repetitions,
                 next_review_date = excluded.next_review_date
            `, [currentExercise.id, nextData.easeFactor, nextData.interval, nextData.repetitions, nextData.nextReviewDate]);

        } catch (e) {
            console.error("Failed to update SRS data:", e);
        }

        if (isCorrect) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            dispatch(recordCorrectAnswer(10)); // Reward 10 XP per question
            dispatch(addXP(10)); // Update global user stats immediately (MVP scope)

            setTimeout(() => {
                proceedToNext();
            }, 1000);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            shakeAnimation.value = withSequence(
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(0, { duration: 50 })
            );
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

            setTimeout(() => {
                setSelectedAnswer(null);
            }, 1000);
        }
    };

    const proceedToNext = () => {
        setSelectedAnswer(null);
        if (currentExerciseIndex < exercises.length - 1) {
            dispatch(nextExercise());
        } else {
            // End of Lesson
            dispatch(endSession());
            const title = isPractice ? t('review.title') : t('common.continue');
            const message = isPractice ? "Review Complete!" : "You finished all exercises in this level.";
            Alert.alert(title, message, [
                { text: "Awesome", onPress: () => navigation.goBack() }
            ]);
            // Persistence to user_progress handled cleanly by middleware.
        }
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: shakeAnimation.value }],
        };
    });

    if (loading || !isActive) {
        return <View style={styles.container}><Text>Loading Exercises...</Text></View>;
    }

    if (!currentExercise) {
        return <View style={styles.container}><Text>No exercises found for this level.</Text></View>;
    }

    const content = JSON.parse(currentExercise.content_json);

    const getOptionStyle = (opt: string) => {
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
                        onPress={() => handleAnswerSubmit('true')}
                    >
                        <Text style={styles.optionText}>{t('common.true')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={getOptionStyle('false')}
                        onPress={() => handleAnswerSubmit('false')}
                    >
                        <Text style={styles.optionText}>{t('common.false')}</Text>
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
                            onPress={() => handleAnswerSubmit(opt)}
                        >
                            <Text style={styles.optionText}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }

        // fallback for 'ordering' types on MVP
        return (
            <View style={styles.optionsContainer}>
                <Text style={styles.comingSoon}>This exercise type ({currentExercise.type}) is under construction for MVP.</Text>
                <TouchableOpacity style={styles.optionButton} onPress={() => handleAnswerSubmit(currentExercise.correct_answer)}>
                    <Text style={styles.optionText}>Skip / Auto-Correct</Text>
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
                        <Text style={styles.heartText}>{t('exercise.practiceLabel')}</Text>
                    ) : (
                        <>
                            <HeartIcon size={24} color={theme.colors.danger} fill={theme.colors.danger} />
                            <Text style={styles.heartText}>{hearts}</Text>
                        </>
                    )}
                </View>
            </View>

            <Animated.View style={[styles.questionArea, animatedStyle]}>
                <Text style={styles.questionLabel}>{t('exercise.questionLabel')}</Text>
                <Text style={styles.questionText}>{content.question}</Text>
            </Animated.View>

            {renderOptions()}

            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.checkButton, !selectedAnswer && styles.checkButtonDisabled]}
                    disabled={!selectedAnswer}
                    activeOpacity={0.8}
                    onPress={() => selectedAnswer && handleAnswerSubmit(selectedAnswer)}
                >
                    <Text style={styles.checkButtonText}>{t('common.check')}</Text>
                </TouchableOpacity>
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
        ...theme.typography.h3,
        color: theme.colors.danger,
    },
    questionArea: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
    },
    questionLabel: {
        ...theme.typography.h3,
        color: theme.colors.textMuted,
        marginBottom: 10,
        textAlign: isRTL ? 'right' : 'left',
    },
    questionText: {
        ...theme.typography.h1,
        color: theme.colors.textMain,
        lineHeight: 36,
        textAlign: isRTL ? 'right' : 'left',
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
        ...theme.typography.h3,
        color: theme.colors.textMain,
    },
    comingSoon: {
        ...theme.typography.bodySmall,
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
        ...theme.typography.h3,
        color: theme.colors.surface,
        letterSpacing: 1,
    }
});
