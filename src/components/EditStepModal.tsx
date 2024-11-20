import React, { useState } from "react";
import { View, TextInput, Button, Modal } from "react-native";

type EditStepModalProps = {
  visible: boolean;
  onClose: () => void;
  step: { date: string; note: string };
  onSave: (updatedStep: { date: string; note: string }) => void;
};

export default function EditStepModal({
  visible,
  onClose,
  step,
  onSave,
}: EditStepModalProps) {
  const [note, setNote] = useState(step.note);

  const handleSave = () => {
    if (note.trim()) {
      onSave({ date: step.date, note: note.trim() });
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="w-3/4 bg-gray-200 p-4 rounded-lg mx-auto my-auto shadow-lg">
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Edit Step Note"
          className="p-2 rounded bg-white mb-4"
        />
        <Button title="Save" onPress={handleSave} color="#8B0000" />
        <Button title="Cancel" onPress={onClose} color="#8B0000" />
      </View>
    </Modal>
  );
}
