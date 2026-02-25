import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { loadPendingReviews } from '../store/slices/curriculumSlice';
import { AppText } from '../components/AppText';

type ReviewScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

interface ReviewScreenProps {
    navigation: ReviewScreenNavProp;
}

export default function ReviewScreen({ navigation }: ReviewScreenProps) {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const completedCount = useSelector((state: RootState) => state.curriculum.pendingReviewCount);

    useFocusEffect(
        useCallback(() => {
            dispatch(loadPendingReviews());
        }, [dispatch])
    );

    const handleStartReview = () => {
        if (completedCount === 0) {
            alert(t('review.lessonsReady') + ' : 0');
            return;
        }
        // Navigate to ExerciseScreen in practice mode, -1 signals SRS fetch
        navigation.navigate('Exercise', { levelId: -1, isPractice: true });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <AppText style={styles.title} variant="h1">{t('review.title')}</AppText>
                    <AppText style={styles.subtitle} variant="body">{t('review.subtitle')}</AppText>
                </View>

                <View style={styles.statsCard}>
                    <AppText style={styles.statsNumber}>{completedCount}</AppText>
                    <AppText style={styles.statsText} variant="body">{t('review.lessonsReady')}</AppText>
                </View>

                <TouchableOpacity
                    style={[styles.reviewButton, completedCount === 0 && { opacity: 0.5 }]}
                    activeOpacity={0.8}
                    disabled={completedCount === 0}
                    onPress={handleStartReview}
                >
                    <AppText style={styles.reviewButtonText} variant="h3">{t('review.startPractice')}</AppText>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scroll: {
        padding: theme.layout.screenPadding,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginVertical: 40,
    },
    title: {
        color: theme.colors.primary,
        marginBottom: 10,
    },
    subtitle: {
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 24,
    },
    statsCard: {
        backgroundColor: theme.colors.surface,
        padding: 30,
        borderRadius: theme.layout.borderRadius,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
        marginBottom: 40,
    },
    statsNumber: {
        fontSize: 48,
        fontWeight: '800',
        color: theme.colors.secondary,
    },
    statsText: {
        marginTop: 5,
    },
    reviewButton: {
        backgroundColor: theme.colors.primary,
        width: '100%',
        paddingVertical: 18,
        borderRadius: theme.layout.borderRadius,
        alignItems: 'center',
        ...theme.shadows.md,
    },
    reviewButtonText: {
        color: theme.colors.surface,
    }
});
