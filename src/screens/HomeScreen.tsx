import React, { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';
import { MoonIcon, PathIcon } from '../components/CustomIcons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { loadCurriculumOverview } from '../store/slices/curriculumSlice';
import { loadUserProfile } from '../store/slices/userSlice';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/AppText';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

interface HomeScreenProps {
    navigation: HomeScreenNavigationProp;
}

import { UnitCard } from '../components/screens/UnitCard';


export default function HomeScreen({ navigation }: HomeScreenProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const units = useSelector((state: RootState) => state.curriculum.units);
    const user = useSelector((state: RootState) => state.user);
    const [expandedUnit, setExpandedUnit] = useState<number | null>(null);

    useFocusEffect(
        useCallback(() => {
            dispatch(loadUserProfile());
            dispatch(loadCurriculumOverview());
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
                    <AppText style={styles.greeting} variant="h1">{t('home.greeting')}</AppText>
                    <AppText style={styles.subGreeting} variant="body">{t('home.subGreeting')}</AppText>
                </View>

                <View style={styles.categories}>
                    <AppText style={styles.sectionTitle} variant="h2">{t('home.curriculum')}</AppText>
                    {units.map((unit: any) => (
                        <UnitCard
                            key={unit.id}
                            unit={unit}
                            expanded={expandedUnit === unit.id}
                            onToggle={() => toggleUnit(unit.id)}
                            onNodePress={handleNodePress}
                        />
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
        color: theme.colors.primary,
    },
    subGreeting: {
        marginTop: 5,
    },
    categories: {
        flex: 1,
    },
    sectionTitle: {
        marginBottom: 15,
        color: theme.colors.textMain,
    }
});
