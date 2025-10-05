import React from 'react';
import {Text, View, SectionList, StatusBar, Pressable, StyleSheet, ScrollView, FlatList} from 'react-native';
import ToggleSwitch from './ToggleSwitch';
import { Button } from '@react-navigation/elements';
import { router } from 'expo-router';

// creating what the settings categories & subcategories will be, 
const ThemeToggle = () => {
  return(
    <View style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      width: '100%' 
      }}>
      <Text>Change Theme</Text>
      <ToggleSwitch />
    </View>
  )
};
const TwoFA_Toggle = () => {
  return(
    <View style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      width: '100%' 
      }}>
      <Text>Two Factor Authentication</Text>
      <ToggleSwitch />
    </View>
  )
};
const DATA = [ 
  {

    title: "Organisational Details",
    data: ["Name","Mayor Name", "Office Address", "Username", "Contact Number", "Profile Picture"]
  },
  {
    title: "Preferences",
    data: [<ThemeToggle key={'theme-toggle'}/>] // key to uniquely identify and reliably track the item
  },
  {
    title: "Activity & Administration",
    data: ["Approved Petitions", "Pending Petitions", "Rejected Petitions", "Suspended Accounts"]
  },
  {
    title: "Login Credentials",
    data: ["Email", "Change Password", <TwoFA_Toggle key={'TwoFA'}/>]
  },
  {
    title: "Account Actions",
    data: ["Disable Account", "Delete Account", 
    <Button title="Log Out" onPress={() => {alert('Logged Out'); router.replace('/SignIn')}} 
    key={'logout'}>Log Out</Button>]
  }
];
const renderItem = ({ item }) => (
  <Pressable style={{ padding: 16 }}>
    <Text style={{ fontSize: 18 }}>{item}</Text>
  </Pressable>
);
const renderSectionHeader = ({ section }) => (
  <Text style={{fontSize:24}}>{section.title}</Text>
);
export default function SettingsSectionsList() {
  return (
    <View>
      <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
      />
    </View>
  );
}
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