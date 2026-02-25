import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Animated from 'react-native-reanimated';
import { theme } from '../theme';
import { useTranslation } from 'react-i18next';
import { AppText } from '../components/AppText';
import { ExerciseHeader } from '../components/screens/ExerciseHeader';
import { ExerciseOptions } from '../components/screens/ExerciseOptions';
import { useExerciseSession } from '../hooks/useExerciseSession';

type ExerciseScreenProps = NativeStackScreenProps<RootStackParamList, 'Exercise'>;

export default function ExerciseScreen({ route, navigation }: ExerciseScreenProps) {
    const { levelId, isPractice } = route.params;
    const { t } = useTranslation();

    const handleComplete = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            // @ts-ignore - Route params definition might be strict, fallback gracefully
            navigation.replace('MainTabs');
        }
    }, [navigation]);

    const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);

    const {
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
    } = useExerciseSession(levelId, !!isPractice, handleComplete, handleGoBack);

    if (loadingExercises || !isActive) {
        return <View style={styles.container}><AppText>Loading Exercises...</AppText></View>;
    }

    if (!currentExercise) {
        return <View style={styles.container}><AppText>No exercises found for this level.</AppText></View>;
    }

    const content = JSON.parse(currentExercise.content_json);

    return (
        <SafeAreaView style={styles.container}>
            <ExerciseHeader
                onClose={handleGoBack}
                currentExerciseIndex={currentExerciseIndex}
                totalExercises={exercises.length}
                isPractice={!!isPractice}
                hearts={hearts}
            />

            <Animated.View style={[styles.questionArea, animatedStyle]}>
                <AppText style={styles.questionLabel} variant="h3">{t('exercise.questionLabel')}</AppText>
                <AppText style={styles.questionText} variant="h1">{content.question}</AppText>
            </Animated.View>

            <ExerciseOptions
                currentExercise={currentExercise}
                selectedAnswer={selectedAnswer}
                isAnswerRevealed={isAnswerRevealed}
                handleAnswerSubmit={handleAnswerSubmit}
            />

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
