import { I18nManager } from 'react-native';

export const isRTL = I18nManager.isRTL;

/**
 * Returns 'right' if the app is currently in RTL mode, otherwise 'left'.
 * Useful for `textAlign` properties to ensure proper text alignment.
 */
export const getTextAlign = (): 'right' | 'left' => {
    return isRTL ? 'right' : 'left';
};
