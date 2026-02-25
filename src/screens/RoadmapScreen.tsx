import React, { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, I18nManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';
import { RoadmapPath } from '../components/screens/RoadmapPath';
import { RoadmapNode } from '../components/screens/RoadmapNode';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { loadRoadmapLevels } from '../store/slices/curriculumSlice';
import { useTranslation } from 'react-i18next';
import { AppText } from '../components/AppText';

type RoadmapScreenProps = NativeStackScreenProps<RootStackParamList, 'Roadmap'>;

const isRTL = I18nManager.isRTL;

interface Level {
    id: number;
    title: string;
    order_index: number;
    is_completed?: number;
}

const { width } = Dimensions.get('window');
const LEVEL_HEIGHT = 150; // Vertical spacing between nodes
const NODE_RADIUS = 35; // Size of the circular button

export default function RoadmapScreen({ route, navigation }: RoadmapScreenProps) {
    const { nodeId, title } = route.params;
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const levels = useSelector((state: RootState) => state.curriculum.roadmapLevels);
    const userHearts = useSelector((state: RootState) => state.user.hearts);

    useFocusEffect(
        useCallback(() => {
            dispatch(loadRoadmapLevels(nodeId));
        }, [nodeId, dispatch])
    );

    const handleLevelPress = (levelId: number) => {
        if (userHearts <= 0) {
            alert(t('exercise.gameOverDesc'));
            return;
        }
        navigation.navigate('Exercise', { levelId });
    };

    // Logic to calculate positions for the winding path
    const getPosition = (index: number) => {
        // Alternates between left, center, right, center
        // If RTL, it should organically sweep from right, center, left, center
        const positionsLTR = [width * 0.5, width * 0.75, width * 0.5, width * 0.25];
        const positionsRTL = [width * 0.5, width * 0.25, width * 0.5, width * 0.75];

        const positions = isRTL ? positionsRTL : positionsLTR;
        const x = positions[index % positions.length];
        const y = index * LEVEL_HEIGHT + (LEVEL_HEIGHT / 2);
        return { x, y };
    };

    const totalHeight = levels.length * LEVEL_HEIGHT + 100;



    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color={theme.colors.textMain} />
                </TouchableOpacity>
                <AppText style={styles.headerTitle} variant="h2">{title}</AppText>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={{ height: totalHeight, paddingBottom: 50 }}>
                <RoadmapPath levels={levels} getPosition={getPosition} />

                {levels.map((level, index) => {
                    const { x, y } = getPosition(index);
                    const isDisabled = userHearts === 0;
                    const isCompleted = level.is_completed === 1;

                    return (
                        <RoadmapNode
                            key={level.id}
                            level={level}
                            x={x}
                            y={y}
                            isCompleted={isCompleted}
                            isDisabled={isDisabled}
                            onPress={handleLevelPress}
                        />
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {}
});
