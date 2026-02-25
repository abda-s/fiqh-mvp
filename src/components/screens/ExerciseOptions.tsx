import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { AppText } from '../AppText';
import { useTranslation } from 'react-i18next';

interface ExerciseOptionsProps {
    currentExercise: any;
    selectedAnswer: string | null;
    isAnswerRevealed: boolean;
    handleAnswerSubmit: (ans: string) => void;
}

export function ExerciseOptions({ currentExercise, selectedAnswer, isAnswerRevealed, handleAnswerSubmit }: ExerciseOptionsProps) {
    const { t } = useTranslation();
    const content = JSON.parse(currentExercise.content_json);

    const getOptionStyle = (opt: string) => {
        if (isAnswerRevealed && opt === currentExercise?.correct_answer) {
            return [styles.optionButton, styles.correctOption];
        }

        if (selectedAnswer !== opt) return styles.optionButton;
        if (selectedAnswer === currentExercise.correct_answer) {
            return [styles.optionButton, styles.correctOption];
        }
        return [styles.optionButton, styles.wrongOption];
    };

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

    return (
        <View style={styles.optionsContainer}>
            <AppText style={styles.comingSoon} variant="bodySmall">This exercise type ({currentExercise.type}) is under construction for MVP.</AppText>
            <TouchableOpacity style={styles.optionButton} disabled={isAnswerRevealed} onPress={() => handleAnswerSubmit(currentExercise.correct_answer)}>
                <AppText style={styles.optionText} variant="h3">Skip / Auto-Correct</AppText>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
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
    }
});
