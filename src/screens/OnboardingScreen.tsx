import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { completeOnboarding } from '../store/slices/userSlice';
import { theme } from '../theme';
import { useTranslation } from 'react-i18next';
import { useSQLiteContext } from 'expo-sqlite';
import { resetDatabase } from '../utils/devUtils';
import { AppText } from '../components/AppText';


export default function OnboardingScreen() {
    const dispatch = useDispatch<AppDispatch>();
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
                <AppText style={styles.title} variant="h1">{t('onboarding.title')}</AppText>
                <AppText style={styles.subtitle} variant="body">{t('onboarding.subtitle')}</AppText>
            </View>

            <View style={styles.section}>
                <AppText style={styles.sectionTitle} variant="h3">{t('onboarding.levelLabel')}</AppText>
                <TouchableOpacity
                    style={[styles.optionCard, level === 'beginner' && styles.optionSelected]}
                    onPress={() => setLevel('beginner')}
                >
                    <AppText style={[styles.optionText, level === 'beginner' && styles.optionTextSelected]} variant="h3">
                        {t('onboarding.levelBeginner')}
                    </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.optionCard, level === 'intermediate' && styles.optionSelected]}
                    onPress={() => setLevel('intermediate')}
                >
                    <AppText style={[styles.optionText, level === 'intermediate' && styles.optionTextSelected]} variant="h3">
                        {t('onboarding.levelIntermediate')}
                    </AppText>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <AppText style={styles.sectionTitle} variant="h3">{t('onboarding.timeLabel')}</AppText>
                <View style={styles.timeRow}>
                    {[5, 10, 15].map(tVal => (
                        <TouchableOpacity
                            key={tVal}
                            style={[styles.timeBox, time === tVal && styles.timeBoxSelected]}
                            onPress={() => setTime(tVal)}
                        >
                            <AppText style={[styles.timeText, time === tVal && styles.timeTextSelected]} variant="h2">{tVal}m</AppText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <TouchableOpacity
                style={[styles.startButton, (!level || !time) && styles.startButtonDisabled]}
                disabled={!level || !time}
                onPress={handleStart}
            >
                <AppText style={styles.startButtonText} variant="h2">{t('onboarding.start')}</AppText>
            </TouchableOpacity>

            {__DEV__ && (
                <TouchableOpacity
                    style={styles.devResetButton}
                    onPress={() => resetDatabase(db)}
                >
                    <AppText style={styles.devResetText}>[DEV] Delete Database</AppText>
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
        color: theme.colors.primary,
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        textAlign: 'center',
        color: theme.colors.textMuted,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        marginBottom: 15,
        color: theme.colors.textMain,
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
