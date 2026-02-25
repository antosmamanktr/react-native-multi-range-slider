import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const MultiRangeSlider = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Multi Range Slider</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});