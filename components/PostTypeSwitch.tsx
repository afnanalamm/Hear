import React, {useState} from 'react';
import {Switch, StyleSheet, View} from 'react-native';
// Code adapted from https://reactnative.dev/docs/switch


const PostTypeSwitch = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <View style={styles.container}>
        <Switch
          trackColor={{false: '#81b0ff', true: '#81b0ff'}}
          thumbColor={isEnabled ? '#f5dd4b' : '#05d605ff'}
          ios_backgroundColor="#da0707ff"
          onValueChange={toggleSwitch}
          value={isEnabled}
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

export default PostTypeSwitch;