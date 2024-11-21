import React, { useEffect, useState } from "react";
import { View, TextInput, Button, FlatList, Modal, Text } from "react-native";

export default function EditStepGroupModal({
  visible,
  onClose,
  group,
  onSave,
}) {
  const [editedSteps, setEditedSteps] = useState(group?.steps || []);

  useEffect(() => {
    setEditedSteps(group?.steps || []);
  }, [group]);

  const handleSave = () => {
    onSave(editedSteps);
    onClose();
  };

  const handleUpdateStep = (index: number, updatedNote: string) => {
    const updated = [...editedSteps];
    updated[index].note = updatedNote;
    setEditedSteps(updated);
  };

  if (!group) return null; // Safety check

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="w-3/4 bg-gray-200 p-4 rounded-lg mx-auto my-auto shadow-lg">
        <Text className="text-lg font-bold mb-4">{group.date}</Text>
        <FlatList
          data={editedSteps}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View className="mb-2">
              <TextInput
                value={item.note}
                onChangeText={(text) => handleUpdateStep(index, text)}
                placeholder="Edit Step Note"
                className="p-2 rounded bg-white mb-2"
              />
            </View>
          )}
        />
        <Button title="Save" onPress={handleSave} color="#8B0000" />
        <Button title="Cancel" onPress={onClose} color="#8B0000" />
      </View>
    </Modal>
  );
}
