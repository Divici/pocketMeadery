import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import AddIngredientModal from "../components/AddIngredientModal";
import EditIngredientGroupModal from "../components/EditIngredientGroupModal";
import AddStepModal from "../components/AddStepModal";
import EditStepGroupModal from "../components/EditStepGroupModal";
import EditStepModal from "../components/EditStepModal";
import IngredientsSection from "../components/IngredientsSection";
import StepsSection from "../components/StepsSection";

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
    const today = new Date().toDateString();
    const existingGroupIndex = editedBatch.steps.findIndex(
      (group) => new Date(group.date).toDateString() === today
    );
  
    let updatedSteps;
  
    if (existingGroupIndex !== -1) {
      const updatedGroup = {
        ...editedBatch.steps[existingGroupIndex],
        steps: [...editedBatch.steps[existingGroupIndex].steps, newStep],
      };
      updatedSteps = [
        ...editedBatch.steps.slice(0, existingGroupIndex),
        updatedGroup,
        ...editedBatch.steps.slice(existingGroupIndex + 1),
      ];
    } else {
      updatedSteps = [
        ...editedBatch.steps,
        { date: today, steps: [newStep] },
      ];
    }
  
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

      <IngredientsSection
        ingredients={editedBatch.ingredients}
        isExpanded={isIngredientsExpanded}
        setIsExpanded={setIsIngredientsExpanded}
        darkMode={darkMode}
        onAddIngredient={() => {
          setIsAddingIngredient(true);
          setIsIngredientsExpanded(true);
        }}
        onEditGroup={(date) => setEditingGroupDate(date)}
      />

      <StepsSection
        steps={editedBatch.steps}
        isExpanded={isStepsExpanded}
        setIsExpanded={setIsStepsExpanded}
        darkMode={darkMode}
        onAddStep={() => {
          setIsAddingStep(true);
          setIsStepsExpanded(true);
        }}
        onEditStep={(index) => setEditingStepIndex(index)}
      />

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

      {/* Edit Step Group Modal */}
      <EditStepGroupModal
        visible={editingGroupDate !== null}
        onClose={() => setEditingGroupDate(null)}
        group={editedBatch.steps.find(
          (group) => new Date(group.date).toDateString() === editingGroupDate
        )}
        onSave={(updatedSteps) => {
          const updatedGroups = editedBatch.steps.map((group) =>
            new Date(group.date).toDateString() === editingGroupDate
              ? { ...group, steps: updatedSteps }
              : group
          );
          setEditedBatch({ ...editedBatch, steps: updatedGroups });
          setEditingGroupDate(null);
          if (setBatches) {
            setBatches((prev) =>
              prev.map((b) => (b.id === editedBatch.id ? { ...b, steps: updatedGroups } : b))
            );
          }
        }}
      />
    </ScrollView>
  );
}
