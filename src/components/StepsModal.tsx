import React from "react";
import { View, Text, TextInput, Button, Modal, FlatList } from "react-native";
import { useTheme } from "../context/ThemeContext";

type StepsModalProps = {
  visible: boolean;
  onClose: () => void;
  steps: { date: string; note: string }[];
  onAdd: (newStep: string) => void;
  onEdit: (updatedSteps: any) => void; // Replace `any` with the appropriate type
};

export default function StepsModal({
  visible,
  onClose,
  steps,
  onAdd,
  onEdit,
}: StepsModalProps) {
  const { darkMode } = useTheme();
  const [newStep, setNewStep] = React.useState("");

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="w-3/4 h-3/4 bg-gray-200 p-4 rounded-lg mx-auto my-auto shadow-lg">
        <FlatList
          data={steps}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View className="mb-2">
              <Text className={`font-bold ${darkMode ? "text-darkGold" : "text-gray-700"}`}>
                {new Date(item.date).toDateString()}:
              </Text>
              <Text
                className={`pl-2 ${darkMode ? "text-darkGold" : "text-gray-700"}`}
                onPress={() => console.log(`Edit: ${item.note}`)} // Implement editing
              >
                {item.note}
              </Text>
            </View>
          )}
        />
        <TextInput
          value={newStep}
          onChangeText={setNewStep}
          placeholder="Add New Step"
          className="p-2 bg-white rounded mb-4"
        />
        <Button
          title="Add Step"
          onPress={() => {
            onAdd(newStep);
            setNewStep("");
          }}
          color={darkMode ? "#FFC300" : "#8B0000"}
        />
        <Button title="Close" onPress={onClose} color="#8B0000" />
      </View>
    </Modal>
  );
}
