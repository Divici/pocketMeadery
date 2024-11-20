import React, { useState } from "react";
import { View, TextInput, FlatList, Button, Modal } from "react-native";

type EditIngredientGroupModalProps = {
  visible: boolean;
  onClose: () => void;
  group: { date: string; items: string[] } | undefined;
  onSave: (updatedItems: string[]) => void;
};

export default function EditIngredientGroupModal({
  visible,
  onClose,
  group,
  onSave,
}: EditIngredientGroupModalProps) {
  const [editedItems, setEditedItems] = useState(group?.items || []);

  const handleItemChange = (index: number, value: string) => {
    const updated = [...editedItems];
    updated[index] = value;
    setEditedItems(updated);
  };

  const handleSave = () => {
    onSave(editedItems);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="w-3/4 bg-gray-200 p-4 rounded-lg mx-auto my-auto shadow-lg">
        <FlatList
          data={editedItems}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TextInput
              value={item}
              onChangeText={(text) => handleItemChange(index, text)}
              className="p-2 rounded bg-white mb-2"
            />
          )}
        />
        <Button title="Done" onPress={handleSave} color="#8B0000" />
        <Button title="Cancel" onPress={onClose} color="#8B0000" />
      </View>
    </Modal>
  );
}
