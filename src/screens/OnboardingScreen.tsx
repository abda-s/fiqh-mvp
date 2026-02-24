import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, I18nManager, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { completeOnboarding } from '../store/slices/userSlice';
import { theme } from '../theme';
import { useTranslation } from 'react-i18next';
import { deleteDatabaseAsync, useSQLiteContext } from 'expo-sqlite';
import { DATABASE_NAME } from '../db/client';

const isRTL = I18nManager.isRTL;

export default function OnboardingScreen() {
    const dispatch = useDispatch();
    const db = useSQLiteContext();
    const { t } = useTranslation();
    const [level, setLevel] = useState<string | null>(null);
    const [time, setTime] = useState<number | null>(null);

    const handleStart = () => {
        if (level && time) {
            dispatch(completeOnboarding({ knowledgeLevel: level, timeCommitment: time }));
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('onboarding.title')}</Text>
                <Text style={styles.subtitle}>{t('onboarding.subtitle')}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('onboarding.levelLabel')}</Text>
                <TouchableOpacity
                    style={[styles.optionCard, level === 'beginner' && styles.optionSelected]}
                    onPress={() => setLevel('beginner')}
                >
                    <Text style={[styles.optionText, level === 'beginner' && styles.optionTextSelected]}>
                        {t('onboarding.levelBeginner')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.optionCard, level === 'intermediate' && styles.optionSelected]}
                    onPress={() => setLevel('intermediate')}
                >
                    <Text style={[styles.optionText, level === 'intermediate' && styles.optionTextSelected]}>
                        {t('onboarding.levelIntermediate')}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('onboarding.timeLabel')}</Text>
                <View style={styles.timeRow}>
                    {[5, 10, 15].map(tVal => (
                        <TouchableOpacity
                            key={tVal}
                            style={[styles.timeBox, time === tVal && styles.timeBoxSelected]}
                            onPress={() => setTime(tVal)}
                        >
                            <Text style={[styles.timeText, time === tVal && styles.timeTextSelected]}>{tVal}m</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <TouchableOpacity
                style={[styles.startButton, (!level || !time) && styles.startButtonDisabled]}
                disabled={!level || !time}
                onPress={handleStart}
            >
                <Text style={styles.startButtonText}>{t('onboarding.start')}</Text>
            </TouchableOpacity>

            {__DEV__ && (
                <TouchableOpacity
                    style={styles.devResetButton}
                    onPress={async () => {
                        try {
                            await db.closeAsync();
                            await deleteDatabaseAsync(DATABASE_NAME);
                            Alert.alert('Database Deleted', 'Please restart the app completely to re-initialize the database schema and seeds.');
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete database: ' + String(e));
                        }
                    }}
                >
                    <Text style={styles.devResetText}>[DEV] Delete Database</Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.layout.screenPadding,
        justifyContent: 'center',
        marginHorizontal: theme.layout.screenPadding,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.primary,
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        ...theme.typography.body,
        textAlign: 'center',
        color: theme.colors.textMuted,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        ...theme.typography.h3,
        marginBottom: 15,
        color: theme.colors.textMain,
        textAlign: isRTL ? 'right' : 'left', // Dynamically sets alignment based on actual UI thread language
    },
    optionCard: {
        backgroundColor: theme.colors.surface,
        padding: 20,
        borderRadius: theme.layout.borderRadius,
        borderWidth: 2,
        borderColor: theme.colors.border,
        marginBottom: 10,
    },
    optionSelected: {
        backgroundColor: theme.colors.primaryLight,
        borderColor: theme.colors.primary,
    },
    optionText: {
        ...theme.typography.h3,
        color: theme.colors.textMain,
        textAlign: 'center',
    },
    optionTextSelected: {
        color: theme.colors.surface,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    timeBox: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        paddingVertical: 18,
        borderRadius: theme.layout.borderRadius,
        borderWidth: 2,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    timeBoxSelected: {
        backgroundColor: theme.colors.secondary,
        borderColor: '#D97706', // Darker gold
    },
    timeText: {
        ...theme.typography.h2,
        color: theme.colors.textMain,
    },
    timeTextSelected: {
        color: theme.colors.surface,
    },
    startButton: {
        backgroundColor: theme.colors.primary,
        padding: 20,
        borderRadius: theme.layout.borderRadius,
        alignItems: 'center',
        marginTop: 20,
        ...theme.shadows.md,
    },
    startButtonDisabled: {
        backgroundColor: theme.colors.border,
    },
    startButtonText: {
        ...theme.typography.h2,
        color: theme.colors.surface,
    },
    devResetButton: {
        marginTop: 30,
        paddingVertical: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.danger,
        borderRadius: theme.layout.borderRadius,
    },
    devResetText: {
        color: theme.colors.danger,
        fontWeight: 'bold',
    }
});
