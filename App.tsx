import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView, Switch } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import BatchListScreen from "./src/screens/BatchListScreen";
import AddEditBatchScreen from "./src/screens/AddEditBatchScreen";
import BatchDetailScreen from "./src/screens/BatchDetailScreen";

import "./global.css"; // Tailwind CSS setup

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <MainApp />
      </NavigationContainer>
    </ThemeProvider>
  );
}

// Separate component for the main app logic
function MainApp() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <SafeAreaView className={`flex-1 ${darkMode ? "bg-darkCream" : "bg-lightCream"}`}>
      {/* Dark Mode Toggle */}
      <Switch
        value={darkMode}
        onValueChange={toggleDarkMode}
        className="absolute top-16 right-4 z-10"
      />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: darkMode ? "#4B3A39" : "#FAF5E4" },
          headerTintColor: darkMode ? "#FFC300" : "#8B0000",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen name="BatchList" component={BatchListScreen} />
        <Stack.Screen name="AddEditBatch" component={AddEditBatchScreen} />
        <Stack.Screen name="BatchDetail" component={BatchDetailScreen} />
      </Stack.Navigator>
    </SafeAreaView>
  );
}
