import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { MoonIcon, PathIcon } from '../CustomIcons';
import { AppText } from '../AppText';

export interface CurriculumNode {
    id: number;
    title: string;
    total_levels: number;
    completed_levels: number;
}

export interface CurriculumUnit {
    id: number;
    title: string;
    description: string;
    nodes: CurriculumNode[];
    totalUnitLevels: number;
    completedUnitLevels: number;
}

interface UnitCardProps {
    unit: CurriculumUnit;
    expanded: boolean;
    onToggle: () => void;
    onNodePress: (nodeId: number, title: string) => void;
}

export function UnitCard({ unit, expanded, onToggle, onNodePress }: UnitCardProps) {
    return (
        <View style={styles.unitContainer}>
            <TouchableOpacity
                style={styles.cardHeader}
                activeOpacity={0.8}
                onPress={onToggle}
            >
                <View style={styles.cardIconBox}>
                    <MoonIcon size={32} color={theme.colors.primary} />
                </View>
                <View style={styles.cardContent}>
                    <AppText style={styles.cardTitle} variant="h3">{unit.title}</AppText>
                    <AppText style={styles.cardDesc} variant="bodySmall">{unit.description}</AppText>
                    {unit.totalUnitLevels > 0 && (
                        <View style={styles.unitProgressContainer}>
                            <View style={[styles.unitProgressBar, { width: `${(unit.completedUnitLevels / unit.totalUnitLevels) * 100}%` }]} />
                        </View>
                    )}
                </View>
                <MaterialCommunityIcons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={28}
                    color={theme.colors.textMuted}
                />
            </TouchableOpacity>

            {expanded && (
                <View style={styles.nodesList}>
                    {unit.nodes.map(node => (
                        <TouchableOpacity
                            key={node.id}
                            style={styles.nodeItem}
                            onPress={() => onNodePress(node.id, node.title)}
                        >
                            <PathIcon size={20} color={theme.colors.secondary} />
                            <AppText style={styles.nodeTitle} variant="h3">{node.title}</AppText>
                            {node.total_levels > 0 && node.completed_levels === node.total_levels ? (
                                <MaterialCommunityIcons name="check-circle-outline" size={24} color={theme.colors.success} style={styles.iconRight} />
                            ) : (
                                <MaterialCommunityIcons name="chevron-left" size={20} color={theme.colors.textMuted} style={styles.iconRight} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    unitContainer: {
        marginBottom: 16,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.layout.borderRadius,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        padding: 20,
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
        marginBottom: 4,
        color: theme.colors.textMain,
    },
    cardDesc: {
        lineHeight: 20,
    },
    nodesList: {
        borderTopWidth: 1,
        borderColor: theme.colors.border,
        padding: 10,
        paddingTop: 10,
    },
    nodeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.background,
    },
    nodeTitle: {
        color: theme.colors.textMain,
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
    },
    iconRight: {
        marginLeft: 'auto',
    }
});
