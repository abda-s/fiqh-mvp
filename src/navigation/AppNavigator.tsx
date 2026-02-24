import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RoadmapScreen from '../screens/RoadmapScreen';
import ExerciseScreen from '../screens/ExerciseScreen';
import ReviewScreen from '../screens/ReviewScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// Theme & Icons
import { theme } from '../theme';
import { PathIcon, ProfileIcon, StarIcon } from '../components/CustomIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export type RootStackParamList = {
    Onboarding: undefined;
    MainTabs: undefined;
    Roadmap: { nodeId: number; title: string };
    Exercise: { levelId: number; isPractice?: boolean };
};

export type TabParamList = {
    Home: undefined;
    Review: undefined;
    Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

// 1. Setup the Bottom Tabs for the main view
function MainTabs() {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textMuted,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                    minHeight: 60 + insets.bottom,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                    paddingTop: 8,
                },
                tabBarIcon: ({ color, size }) => {
                    if (route.name === 'Home') return <PathIcon color={color} size={size} />;
                    if (route.name === 'Review') return <StarIcon color={color} size={size} />;
                    if (route.name === 'Profile') return <ProfileIcon color={color} size={size} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('tabs.learn') }} />
            <Tab.Screen name="Review" component={ReviewScreen} options={{ title: t('tabs.review') }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('tabs.profile') }} />
        </Tab.Navigator>
    );
}

// 2. Setup the Root Stack (Tabs + deeper screens)
export default function AppNavigator() {
    const hasOnboarded = useSelector((state: RootState) => state.user.hasOnboarded);

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: theme.colors.background }
                }}
            >
                {!hasOnboarded ? (
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                ) : (
                    <>
                        <Stack.Screen name="MainTabs" component={MainTabs} />
                        <Stack.Screen name="Roadmap" component={RoadmapScreen} />
                        <Stack.Screen name="Exercise" component={ExerciseScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
