import React from 'react';
import Svg, { Path, Circle, Rect, Polyline, Polygon, SvgProps } from 'react-native-svg';

type IconProps = {
    size?: number;
    color?: string;
} & SvgProps;

export const PathIcon = ({ size = 24, color = 'black', ...props }: IconProps) => (
    // Represents a winding path or book/page
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <Path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </Svg>
);

export const ProfileIcon = ({ size = 24, color = 'black', ...props }: IconProps) => (
    // Represents a user profile
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <Circle cx="12" cy="7" r="4" />
    </Svg>
);

export const MoonIcon = ({ size = 24, color = 'black', ...props }: IconProps) => (
    // Represents Islamic motif/themes for the category cards
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </Svg>
);

export const HeartIcon = ({ size = 24, color = 'black', fill = 'none', ...props }: IconProps & { fill?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </Svg>
);

export const FireIcon = ({ size = 24, color = 'black', fill = 'none', ...props }: IconProps & { fill?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </Svg>
);

export const StarIcon = ({ size = 24, color = 'black', fill = 'none', ...props }: IconProps & { fill?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </Svg>
);
