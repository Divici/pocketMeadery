import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { DatabaseProvider, useDatabase } from '../context/DatabaseContext';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CompletedScreen } from '../screens/CompletedScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CreateBatchScreen } from '../screens/CreateBatchScreen';
import { BatchDetailScreen } from '../screens/BatchDetailScreen';
import { AddStepScreen } from '../screens/AddStepScreen';
import { AddIngredientScreen } from '../screens/AddIngredientScreen';
import { AddReminderScreen } from '../screens/AddReminderScreen';
import { EditStepScreen } from '../screens/EditStepScreen';
import { EditIngredientScreen } from '../screens/EditIngredientScreen';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { lightTheme } from '../theme';

export type RootStackParamList = {
  MainTabs: undefined;
  CreateBatch: undefined;
  BatchDetail: { batchId: string };
  AddStep: { batchId: string };
  AddIngredient: { batchId: string };
  AddReminder: { batchId: string; batchName?: string };
  EditStep: { stepId: string; batchId: string };
  EditIngredient: { ingredientId: string };
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

function useNotificationDeepLink() {
  useEffect(() => {
    function handleNotification(notification: Notifications.Notification) {
      const batchId = notification.request.content.data?.batchId as string | undefined;
      if (batchId && navigationRef.isReady()) {
        navigationRef.navigate('BatchDetail', { batchId });
      }
    }

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response?.notification) handleNotification(response.notification);
    });

    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => handleNotification(response.notification)
    );
    return () => sub.remove();
  }, []);
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowIcon: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: lightTheme.accent,
        tabBarStyle: {
          backgroundColor: lightTheme.primary,
          borderTopWidth: 0,
        },
        tabBarItemStyle: {
          borderRightWidth: 1,
          borderRightColor: 'rgba(255,255,255,0.25)',
        },
        tabBarLabelStyle: {
          fontWeight: '600',
        },
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
  useNotificationDeepLink();

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
    <NavigationContainer ref={navigationRef}>
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
          options={{ title: 'Batch', headerBackTitle: 'All Meads' }}
        />
        <Stack.Screen
          name="AddStep"
          component={AddStepScreenWrapper}
          options={{ title: 'Add Step' }}
        />
        <Stack.Screen
          name="AddIngredient"
          component={AddIngredientScreenWrapper}
          options={{ title: 'Add Ingredient' }}
        />
        <Stack.Screen
          name="AddReminder"
          component={AddReminderScreenWrapper}
          options={{ title: 'Add Reminder' }}
        />
        <Stack.Screen
          name="EditStep"
          component={EditStepScreenWrapper}
          options={{ title: 'Edit Step' }}
        />
        <Stack.Screen
          name="EditIngredient"
          component={EditIngredientScreenWrapper}
          options={{ title: 'Edit Ingredient' }}
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
      onAddStep={() => navigation.navigate('AddStep', { batchId })}
      onAddIngredient={() => navigation.navigate('AddIngredient', { batchId })}
      onAddReminder={(id, name) =>
        navigation.navigate('AddReminder', { batchId: id, batchName: name })
      }
      onEditStep={(stepId) =>
        navigation.navigate('EditStep', { stepId, batchId })
      }
      onEditIngredient={(ingredientId) =>
        navigation.navigate('EditIngredient', { ingredientId })
      }
    />
  );
}

function AddStepScreenWrapper({
  navigation,
  route,
}: {
  navigation: any;
  route: { params: { batchId: string } };
}) {
  const batchId = route.params.batchId;
  return (
    <AddStepScreen
      batchId={batchId}
      onSaved={() => navigation.goBack()}
      onCancel={() => navigation.goBack()}
    />
  );
}

function AddIngredientScreenWrapper({
  navigation,
  route,
}: {
  navigation: any;
  route: { params: { batchId: string } };
}) {
  const batchId = route.params.batchId;
  return (
    <AddIngredientScreen
      batchId={batchId}
      onSaved={() => navigation.goBack()}
      onCancel={() => navigation.goBack()}
    />
  );
}

function AddReminderScreenWrapper({
  navigation,
  route,
}: {
  navigation: any;
  route: { params: { batchId: string; batchName?: string } };
}) {
  const { batchId, batchName } = route.params;
  return (
    <AddReminderScreen
      batchId={batchId}
      batchName={batchName}
      onSaved={() => navigation.goBack()}
      onCancel={() => navigation.goBack()}
    />
  );
}

function EditStepScreenWrapper({
  navigation,
  route,
}: {
  navigation: any;
  route: { params: { stepId: string; batchId: string } };
}) {
  const { stepId, batchId } = route.params;
  return (
    <EditStepScreen
      stepId={stepId}
      batchId={batchId}
      onSaved={() => navigation.goBack()}
      onCancel={() => navigation.goBack()}
    />
  );
}

function EditIngredientScreenWrapper({
  navigation,
  route,
}: {
  navigation: any;
  route: { params: { ingredientId: string } };
}) {
  const { ingredientId } = route.params;
  return (
    <EditIngredientScreen
      ingredientId={ingredientId}
      onSaved={() => navigation.goBack()}
      onCancel={() => navigation.goBack()}
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
