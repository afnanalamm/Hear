import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Keyboard,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const INITIAL_REGION = {
  latitude: 51.50185073438653,
  longitude: -0.14046615655845635,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function SuperMap() {
  const mapRef = useRef(null);
  const [searchText, setSearchText] = useState('');
  const [marker, setMarker] = useState(null);

  const handleSearch = async () => {
    if (!searchText.trim()) return;

    try {
      // Use OpenStreetMap Nominatim
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        searchText
      )}&format=json&addressdetails=1&limit=1`;

      const response = await fetch(url, {
        headers: { 'User-Agent': 'YourAppName/1.0 (your@email.com)' }, // required by Nominatim
      });
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const region = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        // Move map to the location
        mapRef.current?.animateToRegion(region, 1000);
        setMarker({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          title: display_name,
        });
        Keyboard.dismiss();
      } else {
        console.warn('No location found');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Search Bar + Button */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search someplace"
            placeholderTextColor="#828282"
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Map View */}
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={INITIAL_REGION}
          provider={Platform.select({
            ios: PROVIDER_DEFAULT, // Apple Maps on iOS
            android: PROVIDER_GOOGLE, // Google Maps on Android
          })}
          showsCompass={true}
          showsUserLocation={true}
        >
          {marker && (
            <Marker
              coordinate={marker}
              title={marker.title || 'Searched location'}
              description="Searched location"
            />
          )}
        </MapView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.8,
    alignItems: 'center',
  },
  map: {
    width: '90%',
    height: '100%',
    borderRadius: 20,
  },
  searchContainer: {
    position: 'absolute',
    top: 20,
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  searchBar: {
    flex: 1,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    fontStyle: 'italic',
    color: '#000',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 3,
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: '#000',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
