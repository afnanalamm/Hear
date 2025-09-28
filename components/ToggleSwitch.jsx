// import React, {useState} from 'react';
// import {Switch, StyleSheet, View} from 'react-native';
// // Code adapted from https://reactnative.dev/docs/switch


// export default function ToggleSwitch(){
//   const [isEnabled, setIsEnabled] = useState(false);
//   const toggleSwitch = () => setIsEnabled(previousState => !previousState);

//   return (
//     <View style={styles.container}>
//         <Switch
//           trackColor={{false: '#767577', true: '#81b0ff'}}
//           thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
//           ios_backgroundColor="#3e3e3e"
//           onValueChange={toggleSwitch}
//           value={isEnabled}
//         />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

// export default ToggleSwitch;


import React from 'react';
import { Switch, StyleSheet, View } from 'react-native';


export default function ToggleSwitch({ value, onValueChange }) {
  return (
    <View style={styles.container}>
      <Switch
        trackColor={{ false: '#81b0ff', true: '#81b0ff' }}
        thumbColor={value ? '#f5dd4b' : '#05d605ff'}
        ios_backgroundColor="#da0707ff"
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );
};


//chat advice above
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

