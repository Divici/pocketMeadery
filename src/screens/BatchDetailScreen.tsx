import React from "react";
import { View, Text, Button } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";

export default function BatchDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { batch } = route.params;
  const { darkMode } = useTheme();

  const calculateCurrentABV = () => {
    return ((batch.startingGravity - batch.currentGravity) * 131.25).toFixed(2);
  };

  return (
    <View className={`flex-1 p-4 ${darkMode ? "bg-darkCream" : "bg-lightCream"}`}>
      <Text className={`text-2xl font-bold mb-4 ${darkMode ? "text-darkGold" : "text-honeyRed"}`}>
        {batch.name}
      </Text>
      <Text className={`text-sm mb-2 ${darkMode ? "text-darkGold" : "text-gray-700"}`}>
        Start Date: {new Date(batch.startDate).toDateString()}
      </Text>
      <Text className={`text-sm mb-2 ${darkMode ? "text-darkGold" : "text-gray-700"}`}>
        ABV Goal: {batch.abvGoal}%
      </Text>
      <Text className={`text-sm mb-2 ${darkMode ? "text-darkGold" : "text-gray-700"}`}>
        Current ABV: {calculateCurrentABV()}%
      </Text>
      <Text className={`text-sm mb-2 ${darkMode ? "text-darkGold" : "text-gray-700"}`}>
        Starting Gravity: {batch.startingGravity}
      </Text>
      <Text className={`text-sm mb-4 ${darkMode ? "text-darkGold" : "text-gray-700"}`}>
        Notes: {batch.notes}
      </Text>
      <Button
        title="Edit Batch"
        onPress={() =>
          navigation.navigate("AddEditBatch", { batch, setBatches: null })
        }
        color={darkMode ? "#FFC300" : "#8B0000"}
      />
    </View>
  );
}
