import React from 'react';
import MapView, {PROVIDER_DEFAULT} from 'react-native-maps';
import {Marker} from 'react-native-maps';
import { StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// boilerplate code adapted from, and 
// documentation for the library on 
// https://docs.expo.dev/versions/latest/sdk/map-view/#installation
// and https://github.com/react-native-maps/react-native-maps
// {as of 01/09/25}

const INITIAL_REGION = {
  latitude: 51.50185073438653,
  longitude: -0.14046615655845635,
  latitudeDelta: 0,
  longitudeDelta: 0
}

const TextInputExample = () => {
  const [text, onChangeText] = React.useState("Useless Text");
  const [number, onChangeNumber] = React.useState('');

  return (
    <View>
      <TextInput
        onChangeText={onChangeText}
        value={text}
      />
      <TextInput
        onChangeText={onChangeNumber}
        value={number}
        keyboardType="numeric"
      />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <TextInput>
          <TextInputExample/>
        </TextInput>
        <MapView 
          style={styles.map}
          initialRegion={INITIAL_REGION}
          provider={PROVIDER_DEFAULT}
          showsCompass={true}
          showsUserLocation={true}
        >
          <Marker
            coordinate={{latitude: 51.32, longitude: 0}}
            title={"You are here"}
            description={"This is your current location"}
          />
        </MapView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 0.8,
    alignItems: 'center'
  },
  map: {
    width: '90%',
    height: '100%',
    borderRadius: 20
  },
});
