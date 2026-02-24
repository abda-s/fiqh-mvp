import React, { Suspense } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { Provider } from 'react-redux';
import './src/i18n'; // Force i18n & RTL logic to run first
import { store } from './src/store';
import { initDatabase, DATABASE_NAME } from './src/db/client';
import AppNavigator from './src/navigation/AppNavigator';

import { theme } from './src/theme';

function LoadingPlaceholder() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.loadingText}>Loading Islamic Jurisprudence...</Text>
    </View>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Suspense fallback={<LoadingPlaceholder />}>
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase} useSuspense>
          <View style={styles.appContainer}>
            <AppNavigator />
            <StatusBar style="auto" />
          </View>
        </SQLiteProvider>
      </Suspense>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    flex: 1,
  },
  loadingText: {
    marginTop: 20,
    ...theme.typography.h3,
    color: theme.colors.textMain,
  },
});
