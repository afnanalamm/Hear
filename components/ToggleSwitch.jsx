import React, {useState} from 'react';
import {Switch, StyleSheet, View} from 'react-native';
// Code adapted from https://reactnative.dev/docs/switch


const ToggleSwitch = (value, onValueChange) => {
  

  return (
    <View style={styles.container}>
        <Switch
          trackColor={{false: '#81b0ff', true: '#81b0ff'}}
          thumbColor={value ? '#f5dd4b' : '#05d605ff'}
          ios_backgroundColor="#da0707ff"
          onValueChange={onValueChange}
          value={value}
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