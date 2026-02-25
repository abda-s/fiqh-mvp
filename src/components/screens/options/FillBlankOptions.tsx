import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { theme } from '../../../theme';
import { AppText } from '../../AppText';

interface FillBlankOptionsProps {
    sentence: string;
    options: string[];
    selectedAnswer: string | null;
    correctAnswer: string;
    isAnswerRevealed: boolean;
    onSelect: (answer: string) => void;
}

export function FillBlankOptions({
    sentence,
    options,
    selectedAnswer,
    correctAnswer,
    isAnswerRevealed,
    onSelect
}: FillBlankOptionsProps) {
    const parts = sentence.split('=======>');
    const isCorrect = selectedAnswer === correctAnswer;
    
    const getBlankStyle = () => {
        if (!selectedAnswer) {
            return styles.blankPlaceholder;
        }
        if (isAnswerRevealed) {
            return isCorrect ? styles.blankCorrect : styles.blankWrong;
        }
        return styles.blankSelected;
    };

    return (
        <View style={styles.container}>
            <AppText style={styles.title} variant="h3">املأ الفراغ:</AppText>
            
            <View style={styles.sentenceWrapper}>
                <Text style={styles.inlineText}>
                    {parts[0]}
                    <Text style={getBlankStyle()}>
                        {selectedAnswer || '_______'}
                    </Text>
                    {parts[1]}
                </Text>
            </View>
            
            <View style={styles.optionsContainer}>
                {options.map((opt, idx) => (
                    <TouchableOpacity
                        key={idx}
                        style={[
                            styles.option,
                            selectedAnswer === opt && styles.selectedOption,
                            isAnswerRevealed && opt === correctAnswer && styles.correctOption,
                            isAnswerRevealed && selectedAnswer === opt && opt !== correctAnswer && styles.wrongOption
                        ]}
                        disabled={isAnswerRevealed}
                        onPress={() => onSelect(opt)}
                    >
                        <AppText 
                            style={[
                                styles.optionText,
                                selectedAnswer === opt && styles.selectedOptionText,
                                isAnswerRevealed && opt === correctAnswer && styles.correctOptionText
                            ]} 
                            variant="h3"
                        >
                            {opt}
                        </AppText>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1.5,
        paddingHorizontal: 20,
    },
    title: {
        color: theme.colors.primary,
        marginBottom: 15,
        textAlign: 'center',
    },
    sentenceWrapper: {
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 20,
    },
    inlineText: {
        color: theme.colors.textMain,
        fontSize: 18,
        lineHeight: 32,
        textAlign: 'center',
    },
    blankPlaceholder: {
        color: theme.colors.textMuted,
        textDecorationLine: 'underline',
        fontWeight: '600',
    },
    blankSelected: {
        color: theme.colors.primary,
        fontWeight: '700',
    },
    blankCorrect: {
        color: theme.colors.success,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    blankWrong: {
        color: theme.colors.danger,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'center',
    },
    option: {
        backgroundColor: theme.colors.surface,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    selectedOption: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryLight,
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
    selectedOptionText: {
        color: theme.colors.primary,
    },
    correctOptionText: {
        color: theme.colors.success,
    },
});
