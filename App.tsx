import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { DatabaseProvider, useDatabase } from './src/context/DatabaseContext';
import { lightTheme } from './src/theme';

function AppContent() {
  const { db, error, ready } = useDatabase();

  if (!ready) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={lightTheme.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Database error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pocket Meadery</Text>
      <Text style={styles.subtitle}>Database ready</Text>
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <AppContent />
    </DatabaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: lightTheme.text,
  },
  errorText: {
    color: '#c00',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: lightTheme.primary,
  },
  subtitle: {
    marginTop: 8,
    color: lightTheme.muted,
  },
});
