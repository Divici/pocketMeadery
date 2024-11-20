import React, { useState } from "react";
import { View, Text, TextInput, Button, FlatList, Modal } from "react-native";

type EditStepGroupModalProps = {
  visible: boolean;
  onClose: () => void;
  group: { date: string; steps: { date: string; note: string }[] };
  onSave: (updatedSteps: { date: string; note: string }[]) => void;
};

export default function EditStepGroupModal({
  visible,
  onClose,
  group,
  onSave,
}: EditStepGroupModalProps) {
  const [editedSteps, setEditedSteps] = useState(group.steps);

  const handleSave = () => {
    onSave(editedSteps);
    onClose();
  };

  const handleUpdateStep = (index: number, updatedNote: string) => {
    const updated = [...editedSteps];
    updated[index].note = updatedNote;
    setEditedSteps(updated);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="w-3/4 bg-gray-200 p-4 rounded-lg mx-auto my-auto shadow-lg">
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
