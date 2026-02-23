import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { DatabaseProvider, useDatabase } from '../context/DatabaseContext';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CompletedScreen } from '../screens/CompletedScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CreateBatchScreen } from '../screens/CreateBatchScreen';
import { BatchDetailScreen } from '../screens/BatchDetailScreen';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { lightTheme } from '../theme';

export type RootStackParamList = {
  MainTabs: undefined;
  CreateBatch: undefined;
  BatchDetail: { batchId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: lightTheme.primary,
        tabBarInactiveTintColor: lightTheme.muted,
        headerStyle: { backgroundColor: lightTheme.surface },
        headerTintColor: lightTheme.primary,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardTab} />
      <Tab.Screen name="Completed" component={CompletedTab} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function DashboardTab({ navigation }: { navigation: any }) {
  return (
    <DashboardScreen
      onNewBatch={() => navigation.navigate('CreateBatch')}
      onBatchPress={(batchId) =>
        navigation.navigate('BatchDetail', { batchId })
      }
    />
  );
}

function CompletedTab({ navigation }: { navigation: any }) {
  return (
    <CompletedScreen
      onBatchPress={(batchId) =>
        navigation.navigate('BatchDetail', { batchId })
      }
    />
  );
}

function AppNavigatorContent() {
  const { db, error, ready } = useDatabase();

  if (!ready) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={lightTheme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={lightTheme.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: lightTheme.surface },
          headerTintColor: lightTheme.primary,
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateBatch"
          component={CreateBatchScreenWrapper}
          options={{ title: 'New Batch' }}
        />
        <Stack.Screen
          name="BatchDetail"
          component={BatchDetailScreenWrapper}
          options={{ title: 'Batch' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function CreateBatchScreenWrapper({ navigation }: { navigation: any }) {
  return (
    <CreateBatchScreen
      onCreated={(batchId) => {
        navigation.replace('BatchDetail', { batchId });
      }}
      onCancel={() => navigation.goBack()}
    />
  );
}

function BatchDetailScreenWrapper({
  navigation,
  route,
}: {
  navigation: any;
  route: { params: { batchId: string } };
}) {
  const batchId = route.params.batchId;
  return (
    <BatchDetailScreen
      batchId={batchId}
      onAddStep={() => {}}
      onAddIngredient={() => {}}
      onAddReminder={() => {}}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightTheme.background,
  },
});

export function AppNavigator() {
  return (
    <DatabaseProvider>
      <AppNavigatorContent />
    </DatabaseProvider>
  );
}
