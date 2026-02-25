import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { HeartIcon } from '../CustomIcons';
import { AppText } from '../AppText';
import { useTranslation } from 'react-i18next';

interface ExerciseHeaderProps {
    onClose: () => void;
    currentExerciseIndex: number;
    totalExercises: number;
    isPractice: boolean;
    hearts: number;
}

export function ExerciseHeader({ onClose, currentExerciseIndex, totalExercises, isPractice, hearts }: ExerciseHeaderProps) {
    const { t } = useTranslation();
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={28} color={theme.colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: totalExercises > 0 ? `${(currentExerciseIndex / totalExercises) * 100}%` : '0%' } as any]} />
            </View>
            <View style={styles.heartBox}>
                {isPractice ? (
                    <AppText style={styles.heartText} variant="h3">{t('exercise.practiceLabel')}</AppText>
                ) : (
                    <>
                        <HeartIcon size={24} color={theme.colors.danger} fill={theme.colors.danger} />
                        <AppText style={styles.heartText} variant="h3">{hearts}</AppText>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
        color: theme.colors.danger,
    },
});
