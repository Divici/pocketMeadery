import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import AddIngredientModal from "../components/AddIngredientModal";
import EditIngredientGroupModal from "../components/EditIngredientGroupModal";
import AddStepModal from "../components/AddStepModal";
import EditStepModal from "../components/EditStepModal";

export default function BatchDetailScreen() {
  const route = useRoute();
  const { batch, setBatches } = route.params;
  const { darkMode } = useTheme();

  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [editingGroupDate, setEditingGroupDate] = useState<string | null>(null);
  const [isIngredientsExpanded, setIsIngredientsExpanded] = useState(false);

  const [isStepsExpanded, setIsStepsExpanded] = useState(false);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);

  const [editedBatch, setEditedBatch] = useState(batch);

  const handleAddIngredient = (newIngredient: string) => {
    const today = new Date().toDateString();
    const existingGroupIndex = editedBatch.ingredients.findIndex(
      (group) => new Date(group.date).toDateString() === today
    );

    let updatedIngredients;

    if (existingGroupIndex !== -1) {
      const updatedGroup = {
        ...editedBatch.ingredients[existingGroupIndex],
        items: [...editedBatch.ingredients[existingGroupIndex].items, newIngredient.trim()],
      };
      updatedIngredients = [
        ...editedBatch.ingredients.slice(0, existingGroupIndex),
        updatedGroup,
        ...editedBatch.ingredients.slice(existingGroupIndex + 1),
      ];
    } else {
      updatedIngredients = [
        ...editedBatch.ingredients,
        { date: new Date().toISOString(), items: [newIngredient.trim()] },
      ];
    }

    setEditedBatch({ ...editedBatch, ingredients: updatedIngredients });
    if (setBatches) {
      setBatches((prev) =>
        prev.map((b) =>
          b.id === editedBatch.id ? { ...b, ingredients: updatedIngredients } : b
        )
      );
    }
  };

  const handleAddStep = (newStep: { date: string; note: string }) => {
    const updatedSteps = [...editedBatch.steps, newStep];
    setEditedBatch({ ...editedBatch, steps: updatedSteps });
    if (setBatches) {
      setBatches((prev) =>
        prev.map((b) => (b.id === editedBatch.id ? { ...b, steps: updatedSteps } : b))
      );
    }
  };
  
  const handleEditStep = (index: number, updatedStep: { date: string; note: string }) => {
    const updatedSteps = editedBatch.steps.map((step, idx) =>
      idx === index ? updatedStep : step
    );
    setEditedBatch({ ...editedBatch, steps: updatedSteps });
    if (setBatches) {
      setBatches((prev) =>
        prev.map((b) => (b.id === editedBatch.id ? { ...b, steps: updatedSteps } : b))
      );
    }
  };  

  const sortedIngredients = [...editedBatch.ingredients].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <ScrollView className={`flex-1 p-4 ${darkMode ? "bg-darkCream" : "bg-lightCream"}`}>
      {/* Ingredients Section */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-2">
          <TouchableOpacity
            onPress={() => setIsIngredientsExpanded(!isIngredientsExpanded)}
            className="flex-row items-center justify-center flex-1"
          >
            <Text className={`text-lg font-bold ${darkMode ? "text-darkGold" : "text-honeyRed"} text-center mr-2 ml-16`}>
              Ingredients
            </Text>
            <MaterialIcons
              name={isIngredientsExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={24}
              color={darkMode ? "#FFC300" : "#8B0000"}
            /> 
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            setIsAddingIngredient(true) 
            setIsIngredientsExpanded(true)
            }} 
            className="ml-4"
          >
            <MaterialIcons
              name={"add-circle"}
              size={36}
              color={darkMode ? "#FFC300" : "#8B0000"}
            /> 
          </TouchableOpacity>
        </View>

        {isIngredientsExpanded && (
          <View style={{ maxHeight: "40VH" }} className="">
            <FlatList
              data={sortedIngredients}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View className="mb-2 shadow-inner">
                  <View className="flex-row justify-start items-center mb-1">
                    <Text className={`text-sm font-bold ${darkMode ? "text-darkGold" : "text-gray-700"}`}>
                      {new Date(item.date).toDateString()}:
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setEditingGroupDate(new Date(item.date).toDateString())
                      }
                      className="ml-4"
                    >
                      <MaterialIcons
                        name={"edit-note"}
                        size={24}
                        color={darkMode ? "#FFC300" : "#8B0000"}
                      /> 
                    </TouchableOpacity>
                  </View>
                  {item.items.map((ingredient, idx) => (
                    <Text key={idx} className={`pl-2 ${darkMode ? "text-darkGold" : "text-gray-700"}`}>
                      - {ingredient}
                    </Text>
                  ))}
                </View>
              )}
            />
          </View>
        )}
      </View>

      {/* Steps Section */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-2">
          <TouchableOpacity
            onPress={() => setIsStepsExpanded(!isStepsExpanded)}
            className="flex-row items-center justify-center flex-1"
          >
            <Text className={`text-lg font-bold ${darkMode ? "text-darkGold" : "text-honeyRed"} text-center mr-2 ml-16`}>
              Steps
            </Text>
            <MaterialIcons
              name={isStepsExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={24}
              color={darkMode ? "#FFC300" : "#8B0000"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setIsAddingStep(true);
              setIsStepsExpanded(true);
            }}
            className="ml-4"
          >
            <MaterialIcons
              name={"add-circle"}
              size={36}
              color={darkMode ? "#FFC300" : "#8B0000"}
            />
          </TouchableOpacity>
        </View>

        {isStepsExpanded && (
          <View style={{ maxHeight: "40VH" }}>
            <FlatList
              data={editedBatch.steps}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View className="mb-2 shadow-inner">
                  <View className="flex-row justify-start items-center mb-1">
                    <Text className={`text-sm font-bold ${darkMode ? "text-darkGold" : "text-gray-700"}`}>
                      {new Date(item.date).toDateString()}:
                    </Text>
                    <TouchableOpacity
                      onPress={() => setEditingStepIndex(index)}
                      className="ml-4"
                    >
                      <MaterialIcons
                        name={"edit-note"}
                        size={24}
                        color={darkMode ? "#FFC300" : "#8B0000"}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text className={`pl-2 ${darkMode ? "text-darkGold" : "text-gray-700"}`}>
                    <MaterialIcons
                      name={"circle"}
                      size={8}
                    />
                    {" "}{item.note}
                  </Text>
                </View>
              )}
            />
          </View>
        )}
      </View>

      {/* Add Ingredient Modal */}
      <AddIngredientModal
        visible={isAddingIngredient}
        onClose={() => setIsAddingIngredient(false)}
        onAdd={handleAddIngredient}
      />

      {/* Edit Ingredient Group Modal */}
      {editingGroupDate && (
        <EditIngredientGroupModal
          visible={!!editingGroupDate}
          onClose={() => setEditingGroupDate(null)}
          group={editedBatch.ingredients.find(
            (group) => new Date(group.date).toDateString() === editingGroupDate
          )}
          onSave={(updatedItems) => {
            const updatedIngredients = editedBatch.ingredients.map((group) =>
              new Date(group.date).toDateString() === editingGroupDate
                ? { ...group, items: updatedItems }
                : group
            );
            setEditedBatch({ ...editedBatch, ingredients: updatedIngredients });
            setEditingGroupDate(null);
            if (setBatches) {
              setBatches((prev) =>
                prev.map((b) =>
                  b.id === editedBatch.id ? { ...b, ingredients: updatedIngredients } : b
                )
              );
            }
          }}
        />
      )}

      {/* Add Step Modal */}
      <AddStepModal
        visible={isAddingStep}
        onClose={() => setIsAddingStep(false)}
        onAdd={handleAddStep}
      />

      {/* Edit Step Modal */}
      {editingStepIndex !== null && (
        <EditStepModal
          visible={editingStepIndex !== null}
          onClose={() => setEditingStepIndex(null)}
          step={editedBatch.steps[editingStepIndex]}
          onSave={(updatedStep) => {
            handleEditStep(editingStepIndex, updatedStep);
            setEditingStepIndex(null);
          }}
        />
      )}

    </ScrollView>
  );
}
