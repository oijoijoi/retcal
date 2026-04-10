import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface BottomPanelProps {
  onAddPeriod: () => void;
  onSettings: () => void;
}

export function BottomPanel({ onAddPeriod, onSettings }: BottomPanelProps) {
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        {/* Кнопка добавления периода */}
        <Pressable
          onPress={onAddPeriod}
          style={styles.addButton}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.buttonText}>Добавить период</Text>
        </Pressable>

        {/* Кнопка настроек */}
        <Pressable
          onPress={onSettings}
          style={styles.settingsButton}
        >
          <Ionicons name="settings" size={20} color="white" />
          <Text style={styles.buttonText}>Настройки</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
});