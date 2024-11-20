import React, { useState } from "react";
import { View, TextInput, Button, Modal } from "react-native";

type AddIngredientModalProps = {
  visible: boolean;
  onClose: () => void;
  onAdd: (newIngredient: string) => void;
};

export default function AddIngredientModal({ visible, onClose, onAdd }: AddIngredientModalProps) {
  const [newIngredient, setNewIngredient] = useState("");

  const handleSave = () => {
    if (newIngredient.trim()) {
      onAdd(newIngredient);
      setNewIngredient("");
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="w-3/4 bg-gray-200 p-4 rounded-lg mx-auto my-auto shadow-lg">
        <TextInput
          value={newIngredient}
          onChangeText={setNewIngredient}
          placeholder="Add Ingredient"
          className="p-2 rounded bg-white mb-4"
        />
        <Button title="Save" onPress={handleSave} color="#8B0000" />
        <Button title="Cancel" onPress={onClose} color="#8B0000" />
      </View>
    </Modal>
  );
}
