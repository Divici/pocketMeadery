import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { Batch } from "../types/Batch";

export default function AddEditBatchScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { darkMode } = useTheme();

  const { setBatches, batch }: any = route.params || {}; // Passed when editing
  const isEditing = Boolean(batch); // Determine if we're editing or adding

  // State for form inputs
  const [name, setName] = useState("");
  const [abvGoal, setAbvGoal] = useState<string>("");
  const [startingGravity, setStartingGravity] = useState<string>("");

  // Populate fields if editing
  useEffect(() => {
    if (isEditing) {
      setName(batch.name || "");
      setAbvGoal(batch.abvGoal.toString() || "");
      setStartingGravity(batch.startingGravity.toString() || "");
    }
  }, [batch]);

  const handleSave = () => {
    if (!name || !abvGoal || !startingGravity) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    const newBatch: Batch = {
      id: isEditing ? batch.id : Date.now().toString(), // Unique ID for new batches
      name,
      startDate: isEditing ? batch.startDate : new Date().toISOString(),
      abvGoal: parseFloat(abvGoal),
      targetStartingGravity: parseFloat(startingGravity),
      startingGravity: parseFloat(startingGravity),
      currentGravity: parseFloat(startingGravity),
      currentABV: 0,
      ingredients: [],
      steps: [],
      notes: "",
    };

    // Update the batches list
    setBatches((prev: Batch[]) => {
      if (isEditing) {
        return prev.map((b) => (b.id === batch.id ? newBatch : b));
      } else {
        return [...prev, newBatch];
      }
    });

    navigation.goBack(); // Return to BatchListScreen
  };

  return (
    <View className="flex-1 p-4 bg-gray-100">
      <Text className="text-2xl font-bold text-gray-800 mb-4">
        {isEditing ? "Edit Batch" : "Add New Batch"}
      </Text>

      {/* Name Input */}
      <Text className="text-lg font-semibold text-gray-700 mb-2">Batch Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g., Golden Pyment"
        className="p-2 bg-white rounded border border-gray-300 mb-4"
      />

      {/* ABV Goal Input */}
      <Text className="text-lg font-semibold text-gray-700 mb-2">ABV Goal (%)</Text>
      <TextInput
        value={abvGoal}
        onChangeText={setAbvGoal}
        placeholder="e.g., 14"
        keyboardType="numeric"
        className="p-2 bg-white rounded border border-gray-300 mb-4"
      />

      {/* Starting Gravity Input */}
      <Text className="text-lg font-semibold text-gray-700 mb-2">Starting Gravity</Text>
      <TextInput
        value={startingGravity}
        onChangeText={setStartingGravity}
        placeholder="e.g., 1.110"
        keyboardType="numeric"
        className="p-2 bg-white rounded border border-gray-300 mb-4"
      />

      {/* Save Button */}
      <Button
        title={isEditing ? "Save Changes" : "Add Batch"}
        onPress={handleSave}
        color="#8B0000"
      />
    </View>
  );
}
