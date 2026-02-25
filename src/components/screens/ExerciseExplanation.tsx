import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import { AppText } from '../AppText';

interface ExerciseExplanationProps {
    explanation: string;
}

export function ExerciseExplanation({ explanation }: ExerciseExplanationProps) {
    return (
        <View style={styles.container}>
            <AppText style={styles.title} variant="h3">الشرح</AppText>
            <AppText style={styles.text} variant="body">{explanation}</AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 10,
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        ...theme.shadows.sm,
    },
    title: {
        color: theme.colors.primary,
        marginBottom: 8,
    },
    text: {
        color: theme.colors.textMain,
        lineHeight: 26,
    }
});
