import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../../theme';
import { AppText } from '../../AppText';

interface MultipleChoiceOptionsProps {
    options: string[];
    selectedAnswer: string | null;
    correctAnswer: string;
    isAnswerRevealed: boolean;
    onSelect: (answer: string) => void;
}

export function MultipleChoiceOptions({
    options,
    selectedAnswer,
    correctAnswer,
    isAnswerRevealed,
    onSelect
}: MultipleChoiceOptionsProps) {
    const getOptionStyle = (opt: string) => {
        if (isAnswerRevealed && opt === correctAnswer) {
            return [styles.optionButton, styles.correctOption];
        }
        if (selectedAnswer !== opt) return styles.optionStyle;
        if (selectedAnswer === correctAnswer) {
            return [styles.optionButton, styles.correctOption];
        }
        return [styles.optionButton, styles.wrongOption];
    };

    return (
        <View style={styles.container}>
            {options.map((opt, idx) => (
                <TouchableOpacity
                    key={idx}
                    style={getOptionStyle(opt)}
                    disabled={isAnswerRevealed}
                    onPress={() => onSelect(opt)}
                >
                    <AppText style={styles.optionText} variant="h3">{opt}</AppText>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1.5,
        paddingHorizontal: 20,
        justifyContent: 'flex-start',
        gap: 12,
    },
    optionStyle: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 2,
        borderBottomWidth: 4,
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    optionButton: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 2,
        borderBottomWidth: 4,
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
});
