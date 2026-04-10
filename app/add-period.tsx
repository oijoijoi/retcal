import { Ionicons } from '@expo/vector-icons';
import { parseBirthDateInput } from '@/lib/birth-date';
import { getPeriodDurations, savePeriod } from '@/lib/periods';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PERIOD_TYPES = [
  { id: 'work', name: 'Работа', color: '#3b82f6' },
  { id: 'education', name: 'Образование', color: '#10b981' },
  { id: 'travel', name: 'Путешествия', color: '#f59e0b' },
  { id: 'personal', name: 'Личное', color: '#ef4444' },
  { id: 'health', name: 'Здоровье', color: '#8b5cf6' },
];

export default function AddPeriodScreen() {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedType, setSelectedType] = useState('work');

  const handleDateChange = (
    text: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);

    if (digits.length <= 2) {
      setter(day);
      return;
    }

    if (digits.length <= 4) {
      setter(`${day}.${month}`);
      return;
    }

    setter(`${day}.${month}.${year}`);
  };

  const handleSave = () => {
    if (!title || !startDate || !endDate) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    const start = parseBirthDateInput(startDate);
    const end = parseBirthDateInput(endDate);

    if (!start || !end) {
      Alert.alert('Ошибка', 'Введите даты в формате ДД.ММ.ГГГГ');
      return;
    }

    if (start >= end) {
      Alert.alert('Ошибка', 'Дата окончания должна быть позже даты начала');
      return;
    }

    const { durationWeeks, durationMonths } = getPeriodDurations(start, end);

    const period = {
      id: Date.now().toString(),
      title,
      startDate,
      endDate,
      type: selectedType,
      color: PERIOD_TYPES.find(t => t.id === selectedType)?.color || '#3b82f6',
      durationWeeks,
      durationMonths,
    };

    void savePeriod(period).then(() => {
      Alert.alert('Успех', 'Период успешно добавлен!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Заголовок */}
        <View className="flex-row items-center py-4 px-4 border-b border-gray-200">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900">Добавить период</Text>
        </View>

        <ScrollView className="flex-1 px-4 pt-6">
          {/* Название периода */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Название периода
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Например: Работа в компании X"
              className="border border-gray-300 rounded-lg px-4 py-3 text-lg"
            />
          </View>

          {/* Даты */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Даты
            </Text>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Дата начала</Text>
              <TextInput
                value={startDate}
                onChangeText={value => handleDateChange(value, setStartDate)}
                placeholder="ДД.ММ.ГГГГ"
                className="border border-gray-300 rounded-lg px-4 py-3 text-lg"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2">Дата окончания</Text>
              <TextInput
                value={endDate}
                onChangeText={value => handleDateChange(value, setEndDate)}
                placeholder="ДД.ММ.ГГГГ"
                className="border border-gray-300 rounded-lg px-4 py-3 text-lg"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          {/* Тип периода */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Тип периода
            </Text>
            
            <View className="flex-row flex-wrap gap-3">
              {PERIOD_TYPES.map((type) => (
                <Pressable
                  key={type.id}
                  onPress={() => setSelectedType(type.id)}
                  className={`px-4 py-3 rounded-lg border-2 ${
                    selectedType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: type.color }}
                    />
                    <Text
                      className={`font-medium ${
                        selectedType === type.id ? 'text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      {type.name}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Кнопка сохранения */}
          <Pressable
            onPress={handleSave}
            className="bg-blue-500 rounded-lg py-4 items-center mb-8"
          >
            <Text className="text-white font-semibold text-lg">Сохранить период</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
