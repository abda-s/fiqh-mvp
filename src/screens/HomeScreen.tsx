import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';
import { MoonIcon, PathIcon } from '../components/CustomIcons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchHomeData } from '../store/slices/curriculumSlice';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getTextAlign } from '../utils/styleUtils';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

interface HomeScreenProps {
    navigation: HomeScreenNavigationProp;
}

interface Node {
    id: number;
    title: string;
    total_levels: number;
    completed_levels: number;
}

interface Unit {
    id: number;
    title: string;
    description: string;
    nodes: Node[];
    totalUnitLevels: number;
    completedUnitLevels: number;
}


export default function HomeScreen({ navigation }: HomeScreenProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const units = useSelector((state: RootState) => state.curriculum.units);
    const user = useSelector((state: RootState) => state.user);
    const [expandedUnit, setExpandedUnit] = useState<number | null>(null);

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchHomeData());
        }, [dispatch])
    );

    const toggleUnit = (unitId: number) => {
        setExpandedUnit(expandedUnit === unitId ? null : unitId);
    };

    const handleNodePress = (nodeId: number, title: string) => {
        navigation.navigate('Roadmap', { nodeId, title });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[styles.greeting, { textAlign: getTextAlign() }]}>{t('home.greeting')}</Text>
                    <Text style={[styles.subGreeting, { textAlign: getTextAlign() }]}>{t('home.subGreeting')}</Text>
                </View>

                <View style={styles.categories}>
                    <Text style={[styles.sectionTitle, { textAlign: getTextAlign() }]}>{t('home.curriculum')}</Text>
                    {units.map((unit) => (
                        <View key={unit.id} style={styles.unitContainer}>
                            <TouchableOpacity
                                style={styles.card}
                                activeOpacity={0.8}
                                onPress={() => toggleUnit(unit.id)}
                            >
                                <View style={styles.cardIconBox}>
                                    <MoonIcon size={32} color={theme.colors.primary} />
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{unit.title}</Text>
                                    <Text style={styles.cardDesc}>{unit.description}</Text>
                                    {unit.totalUnitLevels > 0 && (
                                        <View style={styles.unitProgressContainer}>
                                            <View style={[styles.unitProgressBar, { width: `${(unit.completedUnitLevels / unit.totalUnitLevels) * 100}%` }]} />
                                        </View>
                                    )}
                                </View>
                                <MaterialCommunityIcons
                                    name={expandedUnit === unit.id ? 'chevron-up' : 'chevron-down'}
                                    size={28}
                                    color={theme.colors.textMuted}
                                />
                            </TouchableOpacity>

                            {expandedUnit === unit.id && (
                                <View style={styles.nodesList}>
                                    {unit.nodes.map(node => (
                                        <TouchableOpacity
                                            key={node.id}
                                            style={styles.nodeItem}
                                            onPress={() => handleNodePress(node.id, node.title)}
                                        >
                                            <PathIcon size={20} color={theme.colors.secondary} />
                                            <Text style={styles.nodeTitle}>{node.title}</Text>
                                            {node.total_levels > 0 && node.completed_levels === node.total_levels ? (
                                                <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.success} style={{ marginLeft: 'auto' }} />
                                            ) : (
                                                <MaterialCommunityIcons name="chevron-left" size={20} color={theme.colors.textMuted} style={{ marginLeft: 'auto' }} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
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
    scrollContent: {
        padding: theme.layout.screenPadding,
    },
    header: {
        marginBottom: 30,
        marginTop: 10,
    },
    greeting: {
        ...theme.typography.h1,
        color: theme.colors.primary,
    },
    subGreeting: {
        ...theme.typography.body,
        marginTop: 5,
    },
    categories: {
        flex: 1,
    },
    sectionTitle: {
        ...theme.typography.h2,
        marginBottom: 15,
        color: theme.colors.textMain,
        textAlign: getTextAlign(),
    },
    unitContainer: {
        marginBottom: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.layout.borderRadius,
        padding: 20,
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    cardIconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.successLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15, // Flexbox will reverse this automatically in RTL if react-native-safe-area-context doesn't interfere, but setting strictly RTL logic is handled by standard margin flipping in React Native.
        marginStart: 0,
        marginEnd: 15,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        ...theme.typography.h3,
        marginBottom: 4,
        color: theme.colors.textMain,
        textAlign: getTextAlign(),
    },
    cardDesc: {
        ...theme.typography.bodySmall,
        lineHeight: 20,
        textAlign: getTextAlign(),
    },
    nodesList: {
        backgroundColor: theme.colors.surface,
        borderBottomLeftRadius: theme.layout.borderRadius,
        borderBottomRightRadius: theme.layout.borderRadius,
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: theme.colors.border,
        padding: 10,
        marginTop: -5, // tuck under the card
        paddingTop: 15,
    },
    nodeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.background,
    },
    nodeTitle: {
        ...theme.typography.h3,
        color: theme.colors.textMain,
        textAlign: getTextAlign(),
        flex: 1, // Take up remaining space so the chevron stays on the edge
        paddingHorizontal: 15,
    },
    unitProgressContainer: {
        height: 6,
        backgroundColor: theme.colors.border,
        borderRadius: 3,
        marginTop: 10,
        overflow: 'hidden',
    },
    unitProgressBar: {
        height: '100%',
        backgroundColor: theme.colors.success,
        borderRadius: 3,
    }
});
