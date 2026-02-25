import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { AppText } from '../AppText';

interface RoadmapNodeProps {
    level: { id: number; title: string };
    x: number;
    y: number;
    isCompleted: boolean;
    isDisabled: boolean;
    onPress: (levelId: number) => void;
}

const NODE_RADIUS = 35; // Size of the circular button

export function RoadmapNode({ level, x, y, isCompleted, isDisabled, onPress }: RoadmapNodeProps) {
    return (
        <View
            style={[
                styles.nodeWrapper,
                { left: x - (NODE_RADIUS + 20), top: y - (NODE_RADIUS + 30) }
            ]}
        >
            <TouchableOpacity
                disabled={isDisabled}
                activeOpacity={0.8}
                onPress={() => onPress(level.id)}
                style={[
                    styles.nodeCircle,
                    isDisabled && styles.nodeDisabled,
                    isCompleted && styles.nodeCompleted
                ]}
            >
                <MaterialCommunityIcons
                    name={isCompleted ? "check" : "star"}
                    size={32}
                    color={isDisabled ? '#9CA3AF' : theme.colors.surface}
                />
            </TouchableOpacity>
            <View style={styles.tooltip}>
                <AppText style={styles.tooltipText} variant="bodySmall">{level.title}</AppText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
        fontWeight: '600',
        color: theme.colors.textMain,
        textAlign: 'center',
    }
});
