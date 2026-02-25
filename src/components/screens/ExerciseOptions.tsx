import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import { AppText } from '../AppText';
import {
    MultipleChoiceOptions,
    TrueFalseOptions,
    FillBlankOptions,
    OrderingOptions
} from './options';

interface ExerciseOptionsProps {
    currentExercise: any;
    selectedAnswer: string | null;
    isAnswerRevealed: boolean;
    handleAnswerSubmit: (ans: string) => void;
    orderedWords?: any[];
    onOrderChange?: (order: string) => void;
}

export function ExerciseOptions({ 
    currentExercise, 
    selectedAnswer, 
    isAnswerRevealed, 
    handleAnswerSubmit,
    onOrderChange
}: ExerciseOptionsProps) {
    const content = JSON.parse(currentExercise.content_json);

    switch (currentExercise.type) {
        case 'multiple_choice':
            return (
                <MultipleChoiceOptions
                    options={content.options}
                    selectedAnswer={selectedAnswer}
                    correctAnswer={currentExercise.correct_answer}
                    isAnswerRevealed={isAnswerRevealed}
                    onSelect={handleAnswerSubmit}
                />
            );

        case 'true_false':
            return (
                <TrueFalseOptions
                    selectedAnswer={selectedAnswer}
                    correctAnswer={currentExercise.correct_answer}
                    isAnswerRevealed={isAnswerRevealed}
                    onSelect={handleAnswerSubmit}
                />
            );

        case 'fill_blank':
            return (
                <FillBlankOptions
                    sentence={content.sentence}
                    options={content.options}
                    selectedAnswer={selectedAnswer}
                    correctAnswer={currentExercise.correct_answer}
                    isAnswerRevealed={isAnswerRevealed}
                    onSelect={handleAnswerSubmit}
                />
            );

        case 'ordering':
            return (
                <OrderingOptions
                    words={content.words}
                    correctOrder={currentExercise.correct_answer}
                    isAnswerRevealed={isAnswerRevealed}
                    onOrderChange={onOrderChange || (() => {})}
                />
            );

        default:
            return (
                <View style={styles.comingSoon}>
                    <AppText style={styles.comingSoonText} variant="bodySmall">
                        This exercise type ({currentExercise.type}) is under construction.
                    </AppText>
                </View>
            );
    }
}

const styles = StyleSheet.create({
    comingSoon: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    comingSoonText: {
        textAlign: 'center',
        color: theme.colors.textMuted,
    },
});
