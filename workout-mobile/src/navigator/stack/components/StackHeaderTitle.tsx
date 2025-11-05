import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F96418',
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: '#FFFFFF',
  },
});

export function StackHeaderTitle() {
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Text style={styles.label}>workout</Text>
    </View>
  );
}
