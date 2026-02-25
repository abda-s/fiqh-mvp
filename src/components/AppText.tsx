import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { getTextAlign } from '../utils/styleUtils';
import { theme } from '../theme';

export interface AppTextProps extends TextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall';
    color?: string;
}

export const AppText: React.FC<AppTextProps> = ({
    style,
    variant = 'body',
    color,
    children,
    ...props
}) => {
    // 1. Get the base typography style from the theme based on the variant
    const baseStyle = theme.typography[variant];

    return (
        <Text
            {...props}
            style={[
                baseStyle, // Default theme styling (size, weight, base color)
                { textAlign: getTextAlign() }, // Global RTL support
                color ? { color } : undefined, // Override color if provided explicitly
                style, // Custom styles passed via props (can override everything above)
            ]}
        >
            {children}
        </Text>
    );
};
