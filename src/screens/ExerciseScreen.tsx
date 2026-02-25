import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Animated from 'react-native-reanimated';
import { theme } from '../theme';
import { useTranslation } from 'react-i18next';
import { AppText } from '../components/AppText';
import { ExerciseHeader } from '../components/screens/ExerciseHeader';
import { ExerciseOptions } from '../components/screens/ExerciseOptions';
import { ExerciseExplanation } from '../components/screens/ExerciseExplanation';
import { useExerciseSession } from '../hooks/useExerciseSession';
import { useExerciseOptions } from '../hooks/useExerciseOptions';

type ExerciseScreenProps = NativeStackScreenProps<RootStackParamList, 'Exercise'>;

export default function ExerciseScreen({ route, navigation }: ExerciseScreenProps) {
    const { levelId, isPractice } = route.params;
    const { t } = useTranslation();

    const handleComplete = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
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

    const {
        currentOrder,
        setCurrentOrder,
        getQuestionText,
        getQuestionLabel,
        isCheckDisabled
    } = useExerciseOptions(currentExercise, selectedAnswer);

    if (loadingExercises || !isActive) {
        return (
            <View style={styles.container}>
                <AppText>Loading Exercises...</AppText>
            </View>
        );
    }

    if (!currentExercise) {
        return (
            <View style={styles.container}>
                <AppText>No exercises found for this level.</AppText>
            </View>
        );
    }

    const isOrdering = currentExercise.type === 'ordering';
    const showQuestionArea = currentExercise.type !== 'fill_blank';

    const handleCheckPress = () => {
        if (currentExercise.type === 'ordering' && currentOrder) {
            handleAnswerSubmit(currentOrder);
        } else if (selectedAnswer) {
            handleAnswerSubmit(selectedAnswer);
        }
    };

    const renderContent = () => (
        <>
            {showQuestionArea && !isOrdering && (
                <Animated.View style={[styles.questionArea, animatedStyle]}>
                    {getQuestionLabel() ? (
                        <AppText style={styles.questionLabel} variant="h3">{getQuestionLabel()}</AppText>
                    ) : null}
                    <AppText style={styles.questionText} variant="h1">{getQuestionText()}</AppText>
                </Animated.View>
            )}

            {showQuestionArea && isOrdering && (
                <View style={styles.questionArea}>
                    <AppText style={styles.questionText} variant="h1">{getQuestionText()}</AppText>
                </View>
            )}

            <ExerciseOptions
                currentExercise={currentExercise}
                selectedAnswer={selectedAnswer}
                isAnswerRevealed={isAnswerRevealed}
                handleAnswerSubmit={handleAnswerSubmit}
                onOrderChange={setCurrentOrder}
            />

            {isAnswerRevealed && currentExercise.explanation && (
                <ExerciseExplanation explanation={currentExercise.explanation} />
            )}
        </>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ExerciseHeader
                onClose={handleGoBack}
                currentExerciseIndex={currentExerciseIndex}
                totalExercises={exercises.length}
                isPractice={!!isPractice}
                hearts={hearts}
                isAnswerRevealed={isAnswerRevealed}
            />

            {isOrdering ? (
                <View style={styles.contentContainer}>
                    {renderContent()}
                </View>
            ) : (
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {renderContent()}
                </ScrollView>
            )}

            <View style={styles.bottomBar}>
                {isAnswerRevealed ? (
                    <TouchableOpacity
                        style={styles.continueButton}
                        activeOpacity={0.8}
                        onPress={proceedToNext}
                    >
                        <AppText style={styles.continueButtonText} variant="h3">{t('common.continue')}</AppText>
                    </TouchableOpacity>
                ) : currentExercise.type !== 'fill_blank' && (
                    <TouchableOpacity
                        style={[styles.checkButton, isCheckDisabled && styles.checkButtonDisabled]}
                        disabled={isCheckDisabled}
                        activeOpacity={0.8}
                        onPress={handleCheckPress}
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
    contentContainer: {
        flex: 1,
        paddingBottom: 10,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 10,
    },
    questionArea: {
        paddingHorizontal: 30,
        paddingTop: 20,
        paddingBottom: 10,
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
        paddingBottom: 40,
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
    },
    continueButton: {
        backgroundColor: theme.colors.surface,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    continueButtonText: {
        color: theme.colors.primary,
        letterSpacing: 1,
    },
});
