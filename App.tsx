import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BatchListScreen from './src/screens/BatchListScreen';
import AddEditBatchScreen from './src/screens/AddEditBatchScreen';
import BatchDetailScreen from './src/screens/BatchDetailScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="BatchList">
        <Stack.Screen name="BatchList" component={BatchListScreen} />
        <Stack.Screen name="AddEditBatch" component={AddEditBatchScreen} />
        <Stack.Screen name="BatchDetail" component={BatchDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}