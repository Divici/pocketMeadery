import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function BatchDetailScreen() {
  const route = useRoute();
  const { batch, updateBatch } = route.params as any;

  const [currentGravity, setCurrentGravity] = useState(batch.currentGravity);

  // Calculate the current ABV
  const calculateCurrentABV = (startingGravity: number, currentGravity: number) => {
    return ((startingGravity - currentGravity) * 131.25).toFixed(2);
  };

  const handleUpdate = () => {
    updateBatch(batch.id, { currentGravity });
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold">{batch.name}</Text>
      <Text className="text-lg mt-2">ABV Goal: {batch.abvGoal}%</Text>
      <Text className="text-lg mt-2">Target Starting Gravity: {batch.targetStartingGravity}</Text>
      <Text className="text-lg mt-2">Starting Gravity: {batch.startingGravity}</Text>
      <Text className="text-lg mt-2">Current Gravity:</Text>
      <TextInput
        value={currentGravity.toString()}
        onChangeText={(value) => setCurrentGravity(parseFloat(value))}
        keyboardType="numeric"
        className="border p-2 rounded mb-4"
      />
      <Text className="text-lg mt-2">
        Current ABV: {calculateCurrentABV(batch.startingGravity, currentGravity)}%
      </Text>
      <Button title="Update Gravity" onPress={handleUpdate} />
    </View>
  );
}
