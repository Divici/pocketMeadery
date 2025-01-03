import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function StepsSection({
  steps,
  isExpanded,
  setIsExpanded,
  darkMode,
  onAddStep,
  onEditGroup,
}) {
  const sortedSteps = [...steps].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-2">
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          className="flex-row items-center justify-center flex-1"
        >
          <Text
            className={`text-lg font-bold ${
              darkMode ? "text-darkGold" : "text-honeyRed"
            } text-center mr-2 ml-16`}
          >
            Steps
          </Text>
          <MaterialIcons
            name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={24}
            color={darkMode ? "#FFC300" : "#8B0000"}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onAddStep} 
          className="ml-4"
        >
          <MaterialIcons
            name={"add-circle"}
            size={36}
            color={darkMode ? "#FFC300" : "#8B0000"}
          />
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <View style={{ maxHeight: "40VH" }}>
          <FlatList
            data={sortedSteps}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View className="mb-4">
                <View className="flex-row justify-start items-center mb-2">
                  <Text
                    className={`text-sm font-bold ${
                      darkMode ? "text-darkGold" : "text-gray-700"
                    }`}
                  >
                    {new Date(item.date).toDateString()}:
                  </Text>
                  <TouchableOpacity
                    onPress={() => onEditGroup(new Date(item.date).toDateString())}
                    className="ml-4"
                  >
                    <MaterialIcons
                      name={"edit-note"}
                      size={24}
                      color={darkMode ? "#FFC300" : "#8B0000"}
                    />
                  </TouchableOpacity>
                </View>

                {item.steps.map((step, index) => (
                  <Text
                    key={index}
                    className={`pl-4 ${
                      darkMode ? "text-darkGold" : "text-gray-700"
                    }`}
                  >
                    - {step.note}
                  </Text>
                ))}
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
}
