import React, { useState } from "react";
import { View, Text, TextInput, Button, Modal, FlatList, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";

type IngredientsModalProps = {
  visible: boolean;
  onClose: () => void;
  ingredients: { date: string; items: string[] }[];
  onSave: (updatedIngredients: { date: string; items: string[] }[]) => void;
};

export default function IngredientsModal({
  visible,
  onClose,
  ingredients,
  onSave,
}: IngredientsModalProps) {
  const { darkMode } = useTheme();

  const [localIngredients, setLocalIngredients] = useState(ingredients);
  const [editingIngredient, setEditingIngredient] = useState<string | null>(null);
  const [newIngredient, setNewIngredient] = useState("");

  // Group ingredients by date
  const groupByDate = (ingredients: { date: string; items: string[] }[]) => {
    const grouped: { [key: string]: string[] } = {};
    ingredients.forEach((entry) => {
      const date = new Date(entry.date).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date] = [...grouped[date], ...entry.items];
    });
    return Object.entries(grouped).map(([date, items]) => ({
      date,
      items,
    }));
  };

  const groupedIngredients = groupByDate(localIngredients);

  const handleSave = () => {
    onSave(groupedIngredients);
    onClose();
  };

  const handleCancel = () => {
    setLocalIngredients(ingredients);
    setEditingIngredient(null);
    setNewIngredient("");
    onClose();
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      const today = new Date().toDateString();
      const existingGroup = localIngredients.find(
        (group) => new Date(group.date).toDateString() === today
      );

      if (existingGroup) {
        existingGroup.items.push(newIngredient.trim());
      } else {
        setLocalIngredients([
          ...localIngredients,
          { date: new Date().toISOString(), items: [newIngredient.trim()] },
        ]);
      }
      setNewIngredient("");
    }
  };

  const handleEditIngredient = (date: string, index: number, value: string) => {
    setLocalIngredients((prev) =>
      prev.map((group) =>
        new Date(group.date).toDateString() === date
          ? {
              ...group,
              items: group.items.map((item, idx) => (idx === index ? value : item)),
            }
          : group
      )
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="w-3/4 bg-gray-200 p-4 rounded-lg mx-auto my-auto shadow-lg">
        <FlatList
          data={groupedIngredients}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
            <View className="mb-4">
              <Text className={`font-bold mb-2 ${darkMode ? "text-darkGold" : "text-gray-700"}`}>
                {item.date}:
              </Text>
              {item.items.map((ingredient, idx) => (
                <View key={idx} className="flex-row items-center mb-2">
                  <TextInput
                    value={ingredient}
                    editable={editingIngredient === `${item.date}-${idx}`}
                    onChangeText={(text) => handleEditIngredient(item.date, idx, text)}
                    className={`flex-1 p-2 rounded ${
                      darkMode ? "bg-darkGold text-white" : "bg-white text-black"
                    }`}
                    onFocus={() => setEditingIngredient(`${item.date}-${idx}`)}
                    onBlur={() => setEditingIngredient(null)}
                  />
                </View>
              ))}
            </View>
          )}
        />
        {/* Add Ingredient */}
        <TextInput
          value={newIngredient}
          onChangeText={setNewIngredient}
          placeholder="Add New Ingredient"
          className={`p-2 rounded mb-4 ${darkMode ? "bg-darkGold text-white" : "bg-white text-black"}`}
        />
        <Button
          title="Add Ingredient"
          onPress={handleAddIngredient}
          color={darkMode ? "#FFC300" : "#8B0000"}
        />

        {/* Action Buttons */}
        <View className="flex-row justify-between mt-4">
          <Button title="Cancel" onPress={handleCancel} color="#8B0000" />
          <Button title="Save" onPress={handleSave} color={darkMode ? "#FFC300" : "#8B0000"} />
        </View>
      </View>
    </Modal>
  );
}
