import React, { useState } from "react";
import { View, TextInput, Button, Modal } from "react-native";

type AddStepModalProps = {
  visible: boolean;
  onClose: () => void;
  onAdd: (newStep: { date: string; note: string }) => void;
};

export default function AddStepModal({ visible, onClose, onAdd }: AddStepModalProps) {
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (note.trim()) {
      onAdd({ date: new Date().toISOString(), note: note.trim() });
      setNote("");
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="w-3/4 bg-gray-200 p-4 rounded-lg mx-auto my-auto shadow-lg">
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Add Step Note"
          className="p-2 rounded bg-white mb-4"
        />
        <Button title="Save" onPress={handleSave} color="#8B0000" />
        <Button title="Cancel" onPress={onClose} color="#8B0000" />
      </View>
    </Modal>
  );
}
