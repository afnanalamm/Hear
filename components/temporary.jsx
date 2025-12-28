import React, { useState } from 'react';
import { Text, View, SectionList, Pressable, StyleSheet, Alert } from 'react-native';
import ToggleSwitch from './ToggleSwitch';
import { Button } from '@react-navigation/elements';
import { router } from 'expo-router';
import { useAuthentication } from '../components/AuthenticationContext';

// Theme Toggle Component (unchanged logic)
const ThemeToggle = () => {
  const [isLightTheme, setIsLightTheme] = useState(false);
  const toggleThemeSwitch = () => setIsLightTheme(prev => !prev);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: 16, // added consistent padding like other items
      }}
    >
      <Text style={{ fontSize: 18 }}>Change Theme</Text>
      <ToggleSwitch value={isLightTheme} onValueChange={toggleThemeSwitch} />
    </View>
  );
};

// 2FA Toggle Component (unchanged logic)
const TwoFA_Toggle = () => {
  const [isTwoFAEnabled, setIsTwoFAEnabled] = useState(false);
  const toggleTwoFASwitch = () => setIsTwoFAEnabled(prev => !prev);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: 16,
      }}
    >
      <Text style={{ fontSize: 18 }}>Two Factor Authentication</Text>
      <ToggleSwitch value={isTwoFAEnabled} onValueChange={toggleTwoFASwitch} />
    </View>
  );
};

// Logout Button Component
const LogoutButton = () => {
  const { onLogout } = useAuthentication();

  return (
    <View style={{ padding: 16 }}>
      <Button
        title="Log Out"
        color="#ff4444" // optional: make it stand out
        onPress={async () => {
          try {
            await onLogout();
            Alert.alert('Success', 'Logged Out'); // changed to Alert.alert
            router.replace('/SignIn');
          } catch (error) {
            Alert.alert('Error', 'An error occurred during logout. Please try again.');
          }
        }}
      />
    </View>
  );
};

// Updated DATA structure
// Instead of putting components directly in data[], it now uses objects with a 'type' to distinguish
const DATA = [
  {
    title: "Organisational Details",
    data: [
      "Name",
      "Mayor Name",
      "Office Address",
      "Username",
      "Contact Number",
      "Profile Picture"
    ],
  },
  {
    title: "Preferences",
    data: [{ type: 'component', component: ThemeToggle, key: 'theme-toggle' }],
  },
  {
    title: "Activity & Administration",
    data: [
      "Approved Petitions",
      "Pending Petitions",
      "Rejected Petitions",
      "Suspended Accounts"
    ],
  },
  {
    title: "Login Credentials",
    data: [
      "Email",
      "Change Password",
      { type: 'component', component: TwoFA_Toggle, key: 'twofa-toggle' },
    ],
  },
  {
    title: "Account Actions",
    data: [
      "Disable Account",
      "Delete Account",
      { type: 'component', component: LogoutButton, key: 'logout-button' },
    ],
  },
];

// Updated renderItem to handle both strings and components
const renderItem = ({ item }) => {
  if (typeof item === 'string') {
    return (
      <Pressable style={{ padding: 16 }}>
        <Text style={{ fontSize: 18 }}>{item}</Text>
      </Pressable>
    );
  }

  if (item.type === 'component') {
    const Component = item.component;
    return <Component />; // Render the actual component
  }

  return null;
};

// Section header unchanged
const renderSectionHeader = ({ section }) => (
  <View style={{ padding: 16, backgroundColor: '#f0f0f0' }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{section.title}</Text>
  </View>
);

export default function SettingsSectionsList() {
  return (
    <View style={{ flex: 1 }}>
      <SectionList
        sections={DATA}
        keyExtractor={(item, index) =>
          typeof item === 'string' ? item + index : item.key
        }
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={true}
      />
    </View>
  );
}

// Kept styles (though currently unused — you can expand later)
const styles = StyleSheet.create({
  pressableItem: {
    backgroundColor: '#0090ffff',
    padding: 20,
    marginVertical: 8,
  },
  header: {
    fontSize: 32,
    backgroundColor: '#ff1010ff',
  },
  itemText: {
    fontSize: 24,
  },
});