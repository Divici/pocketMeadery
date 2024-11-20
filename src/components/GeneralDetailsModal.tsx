import React from "react";
import { View, TextInput, Button, Modal } from "react-native";
import { useTheme } from "../context/ThemeContext";

type GeneralDetailsModalProps = {
  visible: boolean;
  onClose: () => void;
  batch: any; // Replace `any` with the Batch type
  onSave: (updatedBatch: any) => void; // Replace `any` with the Batch type
};

export default function GeneralDetailsModal({
  visible,
  onClose,
  batch,
  onSave,
}: GeneralDetailsModalProps) {
  const { darkMode } = useTheme();
  const [updatedBatch, setUpdatedBatch] = React.useState(batch);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="w-3/4 h-3/4 bg-gray-200 p-4 rounded-lg mx-auto my-auto shadow-lg">
        <TextInput
          value={updatedBatch.name}
          onChangeText={(text) => setUpdatedBatch({ ...updatedBatch, name: text })}
          placeholder="Batch Name"
          className="p-2 bg-white rounded mb-4"
        />
        <TextInput
          value={updatedBatch.startingGravity.toString()}
          onChangeText={(text) =>
            setUpdatedBatch({ ...updatedBatch, startingGravity: parseFloat(text) })
          }
          placeholder="Starting Gravity"
          keyboardType="numeric"
          className="p-2 bg-white rounded mb-4"
        />
        <Button
          title="Save"
          onPress={() => {
            onSave(updatedBatch);
            onClose();
          }}
          color={darkMode ? "#FFC300" : "#8B0000"}
        />
        <Button title="Cancel" onPress={onClose} color="#8B0000" />
      </View>
    </Modal>
  );
}
