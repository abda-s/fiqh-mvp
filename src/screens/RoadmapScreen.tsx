import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, I18nManager } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';
import Svg, { Path } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useTranslation } from 'react-i18next';

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
    const db = useSQLiteContext();
    const { t } = useTranslation();
    const [levels, setLevels] = useState<Level[]>([]);
    const userHearts = useSelector((state: RootState) => state.user.hearts);

    useFocusEffect(
        useCallback(() => {
            loadLevels();
        }, [nodeId])
    );

    const loadLevels = async () => {
        try {
            const data = await db.getAllAsync<Level>(`
                SELECT l.*, IFNULL(up.is_completed, 0) as is_completed
                FROM levels l
                LEFT JOIN user_progress up ON l.id = up.level_id
                WHERE l.node_id = ? 
                ORDER BY l.order_index ASC
            `, [nodeId]);
            setLevels(data);
        } catch (e) {
            console.error(e);
        }
    };

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

    // Generate the SVG path data
    const generatePathData = () => {
        if (levels.length < 2) return '';
        let d = "M " + getPosition(0).x + " " + getPosition(0).y;

        for (let i = 0; i < levels.length - 1; i++) {
            const p1 = getPosition(i);
            const p2 = getPosition(i + 1);

            // Control points for organic cubic bezier curve
            const cp1Y = p1.y + (p2.y - p1.y) / 2;
            const cp1X = p1.x;
            const cp2Y = p1.y + (p2.y - p1.y) / 2;
            const cp2X = p2.x;

            d += " C " + cp1X + " " + cp1Y + ", " + cp2X + " " + cp2Y + ", " + p2.x + " " + p2.y;
        }
        return d;
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color={theme.colors.textMain} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={{ height: totalHeight, paddingBottom: 50 }}>
                {levels.length > 1 && (
                    <Svg style={StyleSheet.absoluteFill}>
                        {/* The background winding path */}
                        <Path
                            d={generatePathData()}
                            stroke={theme.colors.border}
                            strokeWidth={16}
                            fill="none"
                            strokeLinecap="round"
                        />
                        {/* The active/filled path indicator could go here layered on top */}
                    </Svg>
                )}

                {levels.map((level, index) => {
                    const { x, y } = getPosition(index);
                    const isDisabled = userHearts === 0;
                    const isCompleted = level.is_completed === 1;

                    return (
                        <View
                            key={level.id}
                            style={[
                                styles.nodeWrapper,
                                { left: x - (NODE_RADIUS + 20), top: y - (NODE_RADIUS + 30) }
                            ]}
                        >
                            <TouchableOpacity
                                disabled={isDisabled}
                                activeOpacity={0.8}
                                onPress={() => handleLevelPress(level.id)}
                                style={[
                                    styles.nodeCircle,
                                    isDisabled && styles.nodeDisabled,
                                    isCompleted && styles.nodeCompleted
                                ]}
                            >
                                <MaterialCommunityIcons name={isCompleted ? "check" : "star"} size={32} color={isDisabled ? '#9CA3AF' : theme.colors.surface} />
                            </TouchableOpacity>
                            <View style={styles.tooltip}>
                                <Text style={styles.tooltipText}>{level.title}</Text>
                            </View>
                        </View>
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
    headerTitle: {
        ...theme.typography.h2,
    },
    nodeWrapper: {
        position: 'absolute',
        alignItems: 'center',
        width: (NODE_RADIUS + 20) * 2,
    },
    nodeCircle: {
        width: NODE_RADIUS * 2,
        height: NODE_RADIUS * 2,
        borderRadius: NODE_RADIUS,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: theme.colors.surface,
        ...theme.shadows.md,
    },
    nodeDisabled: {
        backgroundColor: theme.colors.border,
    },
    nodeCompleted: {
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.successLight,
    },
    tooltip: {
        marginTop: 8,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.layout.borderRadius,
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    tooltipText: {
        ...theme.typography.bodySmall,
        fontWeight: '600',
        color: theme.colors.textMain,
        textAlign: 'center',
    }
});
