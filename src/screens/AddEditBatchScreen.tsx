import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function AddEditBatchScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { setBatches } = route.params as any;

  const [name, setName] = useState('');
  const [abvGoal, setAbvGoal] = useState('');
  const [startingGravity, setStartingGravity] = useState('');
  const [notes, setNotes] = useState('');
  const [targetStartingGravity, setTargetStartingGravity] = useState<number | null>(null);

  // Calculate the target starting gravity whenever the ABV Goal changes
  useEffect(() => {
    if (abvGoal) {
      const targetSG = (parseFloat(abvGoal) / 131.25) + 1;
      setTargetStartingGravity(parseFloat(targetSG.toFixed(3)));
    }
  }, [abvGoal]);

  const handleSave = () => {
    const newBatch = {
      id: Date.now().toString(),
      name,
      abvGoal: parseFloat(abvGoal),
      targetStartingGravity: targetStartingGravity || 0,
      startingGravity: parseFloat(startingGravity),
      currentGravity: parseFloat(startingGravity), // Initially set to starting gravity
      finalGravity: undefined,
      currentABV: 0,
      notes,
      startDate: new Date().toISOString(),
      ingredients: [],
      steps: [],
    };

    setBatches((prevBatches: any) => [...prevBatches, newBatch]);
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <TextInput
        placeholder="Batch Name"
        value={name}
        onChangeText={setName}
        className="border p-2 rounded mb-4"
      />
      <TextInput
        placeholder="ABV Goal (%)"
        value={abvGoal}
        onChangeText={setAbvGoal}
        keyboardType="numeric"
        className="border p-2 rounded mb-4"
      />
      {targetStartingGravity && (
        <Text className="mb-4">
          Target Starting Gravity: {targetStartingGravity}
        </Text>
      )}
      <TextInput
        placeholder="Actual Starting Gravity"
        value={startingGravity}
        onChangeText={setStartingGravity}
        keyboardType="numeric"
        className="border p-2 rounded mb-4"
      />
      <TextInput
        placeholder="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
        className="border p-2 rounded mb-4"
      />
      <Button title="Save Batch" onPress={handleSave} />
    </View>
  );
}
