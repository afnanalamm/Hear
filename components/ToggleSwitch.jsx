import React from 'react';
import { Switch, StyleSheet, View } from 'react-native';

const ToggleSwitch = ({ value, onValueChange }) => {
  return (
    <View style={styles.container}>
      <Switch
        trackColor={{ false: '#da0707', true: '#00cc00' }}
        thumbColor={value ? '#da0707' : '#05d605ff'}
        ios_backgroundColor="#da0707ff"
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ToggleSwitch;
