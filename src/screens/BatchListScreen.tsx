import React, { useState } from "react";
import { View, FlatList, Text, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import BatchCard from "../components/BatchCard";
import { Batch } from "../types/Batch";

export default function BatchListScreen() {
  const { darkMode } = useTheme();
  const navigation = useNavigation();

  const [batches, setBatches] = useState<Batch[]>([
    {
      id: "1",
      name: "Golden Pyment",
      startDate: new Date().toISOString(),
      abvGoal: 14,
      targetStartingGravity: 1.106,
      startingGravity: 1.110,
      currentGravity: 1.020,
      finalGravity: undefined,
      currentABV: (1.110 - 1.020) * 131.25,
      ingredients: [],
      steps: [],
      notes: "Test batch for golden pyment.",
    },
    {
      id: '2',
      name: 'Cherry Cyser',
      startDate: new Date().toISOString(),
      abvGoal: 12,
      targetStartingGravity: 1.092,
      startingGravity: 1.094,
      currentGravity: 1.040,
      finalGravity: undefined,
      currentABV: (1.094 - 1.040) * 131.25,
      ingredients: [],
      steps: [],
      notes: 'A cherry cyser batch.',
    },
  ]);

  return (
    <View className={`flex-1 p-4 ${darkMode ? "bg-darkCream" : "bg-lightCream"}`}>
      <Text className={`text-2xl font-bold mb-4 ${darkMode ? "text-darkGold" : "text-honeyRed"}`}>
        My Mead Batches
      </Text>
      <FlatList
        data={batches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BatchCard
            batch={item}
            onPress={() => navigation.navigate("BatchDetail", { batch: item })}
            onEditPress={() =>
              navigation.navigate("AddEditBatch", { batch: item, setBatches })
            }
          />
        )}
      />
      <Button
        title="Add New Batch"
        onPress={() => navigation.navigate("AddEditBatch", { setBatches })}
        color={darkMode ? "#FFC300" : "#8B0000"}
      />
    </View>
  );
}
