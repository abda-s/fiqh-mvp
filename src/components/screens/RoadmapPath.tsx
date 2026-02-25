import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../../theme';

interface RoadmapPathProps {
    levels: any[];
    getPosition: (index: number) => { x: number; y: number };
}

export function RoadmapPath({ levels, getPosition }: RoadmapPathProps) {
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

    if (levels.length < 2) return null;

    return (
        <Svg style={StyleSheet.absoluteFill}>
            <Path
                d={generatePathData()}
                stroke={theme.colors.border}
                strokeWidth={16}
                fill="none"
                strokeLinecap="round"
            />
        </Svg>
    );
}
