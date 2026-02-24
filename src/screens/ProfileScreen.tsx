import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, I18nManager } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { theme } from '../theme';
import { FireIcon, StarIcon, HeartIcon, ProfileIcon } from '../components/CustomIcons';
import { useTranslation } from 'react-i18next';

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
                    <Text style={styles.username}>{t('profile.username')}</Text>
                </View>

                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>{t('profile.statsTitle')}</Text>

                    <View style={styles.statGrid}>
                        <View style={styles.statCard}>
                            <FireIcon size={32} color={theme.colors.secondary} fill={theme.colors.secondary} />
                            <Text style={styles.statValue}>{user.streakCount}</Text>
                            <Text style={styles.statLabel}>{t('profile.streak')}</Text>
                        </View>

                        <View style={styles.statCard}>
                            <StarIcon size={32} color={theme.colors.primary} fill={theme.colors.primaryLight} />
                            <Text style={styles.statValue}>{user.totalXP}</Text>
                            <Text style={styles.statLabel}>{t('profile.xp')}</Text>
                        </View>

                        <View style={styles.statCard}>
                            <HeartIcon size={32} color={theme.colors.danger} fill={theme.colors.dangerLight} />
                            <Text style={styles.statValue}>{user.hearts}</Text>
                            <Text style={styles.statLabel}>{t('profile.hearts')}</Text>
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
        ...theme.typography.h2,
        marginTop: 15,
    },
    statsContainer: {
        marginTop: 20,
    },
    sectionTitle: {
        ...theme.typography.h3,
        marginBottom: 15,
        textAlign: isRTL ? 'right' : 'left',
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
        ...theme.typography.h2,
        marginTop: 10,
        color: theme.colors.textMain,
    },
    statLabel: {
        ...theme.typography.bodySmall,
        marginTop: 5,
    }
});
