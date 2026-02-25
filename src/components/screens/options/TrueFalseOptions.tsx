import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../../theme';
import { AppText } from '../../AppText';
import { useTranslation } from 'react-i18next';

interface TrueFalseOptionsProps {
    selectedAnswer: string | null;
    correctAnswer: string;
    isAnswerRevealed: boolean;
    onSelect: (answer: string) => void;
}

export function TrueFalseOptions({
    selectedAnswer,
    correctAnswer,
    isAnswerRevealed,
    onSelect
}: TrueFalseOptionsProps) {
    const { t } = useTranslation();

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
            <TouchableOpacity
                style={getOptionStyle('true')}
                disabled={isAnswerRevealed}
                onPress={() => onSelect('true')}
            >
                <AppText style={styles.optionText} variant="h3">{t('common.true')}</AppText>
            </TouchableOpacity>
            <TouchableOpacity
                style={getOptionStyle('false')}
                disabled={isAnswerRevealed}
                onPress={() => onSelect('false')}
            >
                <AppText style={styles.optionText} variant="h3">{t('common.false')}</AppText>
            </TouchableOpacity>
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
