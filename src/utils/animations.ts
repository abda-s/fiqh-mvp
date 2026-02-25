import { withSequence, withTiming, SharedValue } from 'react-native-reanimated';

/**
 * Triggers a horizontal shake animation on a shared value.
 * @param animationValue The shared value controlling the translateX property.
 */
export const triggerShakeAnimation = (animationValue: SharedValue<number>) => {
    animationValue.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
    );
};
