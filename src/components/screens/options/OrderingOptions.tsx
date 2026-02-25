import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../../theme';
import { AppText } from '../../AppText';
import Sortable from 'react-native-sortables';

interface OrderingOptionsProps {
    words: string[];
    correctOrder: string;
    isAnswerRevealed: boolean;
    onOrderChange: (order: string) => void;
}

interface WordItem {
    word: string;
    originalIndex: number;
}

export function OrderingOptions({
    words,
    correctOrder,
    isAnswerRevealed,
    onOrderChange
}: OrderingOptionsProps) {
    const [orderedWords, setOrderedWords] = useState<WordItem[]>([]);
    const initializedRef = useRef(false);
    const wordsRef = useRef(words);
    wordsRef.current = words;

    useEffect(() => {
        if (!initializedRef.current && wordsRef.current) {
            const initial = wordsRef.current.map((word: string, index: number) => ({
                word,
                originalIndex: index
            }));
            setOrderedWords(initial);
            initializedRef.current = true;
        }
    }, []);

    const handleDragEnd = useCallback((params: { 
        fromIndex: number; 
        toIndex: number; 
        order: <T>(data: Array<T>) => Array<T>;
    }) => {
        const newOrder = params.order(orderedWords);
        setOrderedWords(newOrder);
        const order = newOrder.map(w => w.originalIndex).join(',');
        onOrderChange(order);
    }, [orderedWords, onOrderChange]);

    if (orderedWords.length === 0) {
        return (
            <View style={styles.container}>
                <AppText>Loading...</AppText>
            </View>
        );
    }

    const userOrder = orderedWords.map(w => w.originalIndex).join(',');
    const isCorrect = userOrder === correctOrder;

    const getWordStyle = (index: number, originalIndex: number) => {
        if (isAnswerRevealed) {
            const correctArr = correctOrder.split(',').map(Number);
            const correctPosition = correctArr.indexOf(originalIndex);
            if (correctPosition === index) {
                return [styles.orderWord, styles.correctOrderWord];
            }
            return [styles.orderWord, styles.wrongOrderWord];
        }
        return styles.orderWord;
    };

    if (isAnswerRevealed) {
        return (
            <View style={styles.container}>
                <View style={styles.wordsContainer}>
                    {orderedWords.map((item, index) => (
                        <View 
                            key={`word-${item.originalIndex}`}
                            style={getWordStyle(index, item.originalIndex)}
                        >
                            <AppText style={styles.wordText} variant="h3">{item.word}</AppText>
                        </View>
                    ))}
                </View>
                <View style={styles.hint}>
                    <AppText style={styles.hintText} variant="bodySmall">
                        {isCorrect 
                            ? '✓ صحيح!' 
                            : `الإجابة الصحيحة: ${correctOrder.split(',').map((i: string) => words[parseInt(i)]).join(' ')}`}
                    </AppText>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Sortable.Flex
                gap={12}
                padding={20}
                onDragEnd={handleDragEnd}
            >
                {orderedWords.map((item) => (
                    <View 
                        key={`word-${item.originalIndex}`}
                        style={getWordStyle(0, item.originalIndex)}
                    >
                        <AppText style={styles.wordText} variant="h3">{item.word}</AppText>
                    </View>
                ))}
            </Sortable.Flex>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    wordsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        padding: 20,
        justifyContent: 'center',
    },
    orderWord: {
        backgroundColor: theme.colors.surface,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    correctOrderWord: {
        borderColor: theme.colors.success,
        backgroundColor: theme.colors.successLight,
    },
    wrongOrderWord: {
        borderColor: theme.colors.danger,
        backgroundColor: theme.colors.dangerLight,
    },
    wordText: {
        color: theme.colors.textMain,
    },
    hint: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    hintText: {
        textAlign: 'center',
        color: theme.colors.textMuted,
    }
});
