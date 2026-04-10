import React from 'react';
import { Text, View } from 'react-native';

export function TestTailwind() {
  return (
    <View className="bg-red-500 p-4 m-4 rounded-lg">
      <Text className="text-white text-lg font-bold text-center">
        Тест Tailwind CSS
      </Text>
    </View>
  );
}
