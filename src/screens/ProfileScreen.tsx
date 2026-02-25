import React from 'react';
import { View, StyleSheet, ScrollView, I18nManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { theme } from '../theme';
import { FireIcon, StarIcon, HeartIcon, ProfileIcon } from '../components/CustomIcons';
import { useTranslation } from 'react-i18next';
import { AppText } from '../components/AppText';

const isRTL = I18nManager.isRTL;

export default function ProfileScreen() {
    const user = useSelector((state: RootState) => state.user);
    const { t } = useTranslation();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarCircle}>
                        <ProfileIcon size={60} color={theme.colors.surface} />
                    </View>
                    <AppText style={styles.username} variant="h2">{t('profile.username')}</AppText>
                </View>

                <View style={styles.statsContainer}>
                    <AppText style={styles.sectionTitle} variant="h3">{t('profile.statsTitle')}</AppText>

                    <View style={styles.statGrid}>
                        <View style={styles.statCard}>
                            <FireIcon size={32} color={theme.colors.secondary} fill={theme.colors.secondary} />
                            <AppText style={styles.statValue} variant="h2">{user.streakCount}</AppText>
                            <AppText style={styles.statLabel} variant="bodySmall">{t('profile.streak')}</AppText>
                        </View>

                        <View style={styles.statCard}>
                            <StarIcon size={32} color={theme.colors.primary} fill={theme.colors.primaryLight} />
                            <AppText style={styles.statValue} variant="h2">{user.totalXP}</AppText>
                            <AppText style={styles.statLabel} variant="bodySmall">{t('profile.xp')}</AppText>
                        </View>

                        <View style={styles.statCard}>
                            <HeartIcon size={32} color={theme.colors.danger} fill={theme.colors.dangerLight} />
                            <AppText style={styles.statValue} variant="h2">{user.hearts}</AppText>
                            <AppText style={styles.statLabel} variant="bodySmall">{t('profile.hearts')}</AppText>
                        </View>
                    </View>
                </View>
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
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: 30,
    },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.md,
    },
    username: {
        marginTop: 15,
    },
    statsContainer: {
        marginTop: 20,
    },
    sectionTitle: {
        marginBottom: 15,
    },
    statGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        paddingVertical: 20,
        borderRadius: theme.layout.borderRadius,
        alignItems: 'center',
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    statValue: {
        marginTop: 10,
        color: theme.colors.textMain,
    },
    statLabel: {
        marginTop: 5,
    }
});
