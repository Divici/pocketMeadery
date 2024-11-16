import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Batch } from '../types/Batch';

export default function BatchListScreen() {
  const navigation = useNavigation();

  // Initial batches for testing
  const [batches, setBatches] = useState<Batch[]>([
    {
      id: '1',
      name: 'Golden Pyment',
      startDate: new Date().toISOString(),
      abvGoal: 14,
      targetStartingGravity: 1.106,
      startingGravity: 1.110,
      currentGravity: 1.020,
      finalGravity: undefined,
      currentABV: (1.110 - 1.020) * 131.25, // Calculated ABV
      ingredients: [],
      steps: [],
      notes: 'Test batch for golden pyment.',
    },
    {
      id: '2',
      name: 'Cherry Cyser',
      startDate: new Date().toISOString(),
      abvGoal: 12,
      targetStartingGravity: 1.092,
      startingGravity: 1.094,
      currentGravity: 1.040,
      finalGravity: undefined,
      currentABV: (1.094 - 1.040) * 131.25,
      ingredients: [],
      steps: [],
      notes: 'A cherry cyser batch.',
    },
  ]);

  // Update a batch by ID
  const updateBatch = (id: string, updates: Partial<Batch>) => {
    setBatches((prevBatches) =>
      prevBatches.map((batch) =>
        batch.id === id ? { ...batch, ...updates } : batch
      )
    );
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold mb-4">My Mead Batches</Text>

      {/* Display batches */}
      <FlatList
        data={batches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('BatchDetail', {
                batch: item,
                updateBatch,
              })
            }
          >
            <View className="p-4 bg-white rounded mb-2 shadow">
              <Text className="text-lg font-semibold">{item.name}</Text>
              <Text className="text-sm text-gray-600">
                ABV Goal: {item.abvGoal}%
              </Text>
              <Text className="text-sm text-gray-600">
                Current ABV: {((item.startingGravity - item.currentGravity) * 131.25).toFixed(2)}%
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Button to add a new batch */}
      <Button
        title="Add New Batch"
        onPress={() => navigation.navigate('AddEditBatch', { setBatches })}
      />
    </View>
  );
}
