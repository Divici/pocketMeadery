import React from "react";
import { View, Text, TouchableOpacity, Button } from "react-native";
import { useTheme } from "../context/ThemeContext";

type BatchCardProps = {
  batch: any; // Replace `any` with the `Batch` type
  onPress: () => void; // Default action for tapping the card
  onEditPress: () => void; // Action for tapping the Edit button
};

export default function BatchCard({ batch, onPress, onEditPress }: BatchCardProps) {
  const { darkMode } = useTheme();

  const calculateCurrentABV = () => {
    return ((batch.startingGravity - batch.currentGravity) * 131.25).toFixed(2);
  };

  return (
    <View
      className={`p-4 rounded-lg shadow mb-4 border ${
        darkMode ? "bg-darkCream border-darkGold" : "bg-white border-gray-200"
      }`}
    >
      <TouchableOpacity onPress={onPress}>
        <View className="flex-row justify-between items-center mb-2">
          <Text className={`text-lg font-bold ${darkMode ? "text-darkGold" : "text-honeyRed"}`}>
            {batch.name}
          </Text>
          <Text className="text-sm text-gray-500">
            {new Date(batch.startDate).toDateString()}
          </Text>
        </View>
        <Text className={`text-sm ${darkMode ? "text-darkGold" : "text-gray-700"}`}>
          ABV Goal: {batch.abvGoal}%
        </Text>
        <Text className={`text-sm ${darkMode ? "text-darkGold" : "text-gray-700"}`}>
          Current ABV: {calculateCurrentABV()}%
        </Text>
      </TouchableOpacity>
      {/* Edit Button */}
      <View className="mt-2">
        <Button title="Edit" onPress={onEditPress} color={darkMode ? "#FFC300" : "#8B0000"} />
      </View>
    </View>
  );
}
