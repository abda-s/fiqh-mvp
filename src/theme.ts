export const theme = {
    colors: {
        primary: '#065F46', // Deep Emerald Green
        primaryLight: '#059669',
        secondary: '#F59E0B', // Soft Gold
        background: '#F8FAFC', // Slate 50 (Off-white)
        surface: '#FFFFFF',
        textMain: '#1E293B', // Slate 800
        textMuted: '#64748B', // Slate 500
        danger: '#EF4444', // Heart red
        dangerLight: '#FEE2E2',
        success: '#10B981', // Correct answer green
        successLight: '#D1FAE5',
        border: '#E2E8F0', // Slate 200
    },
    typography: {
        fontFamily: 'System', // Using standard system font for now
        h1: { fontSize: 28, fontWeight: '800' as const, color: '#1E293B' },
        h2: { fontSize: 22, fontWeight: '700' as const, color: '#1E293B' },
        h3: { fontSize: 18, fontWeight: '600' as const, color: '#1E293B' },
        body: { fontSize: 16, fontWeight: '400' as const, color: '#334155' },
        bodySmall: { fontSize: 14, fontWeight: '400' as const, color: '#64748B' },
    },
    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
        },
    },
    layout: {
        screenPadding: 20,
        borderRadius: 16,
        borderWidth: 1.5,
    }
};
