import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";


export default function TabLayout() {
    return (Platform.OS !== 'web') ? (
        <Tabs>
            <Tabs.Screen name='Feed' options={{
                title: 'Feed',
                tabBarIcon: ({color, focused}) => (
                    <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24}/>
                )
                }}/>
            <Tabs.Screen name='Map' options={{
                title: 'Map',
                tabBarIcon: ({color, focused}) => (
                    <Ionicons name={focused ? 'map-sharp' : 'map-outline'} color={color} size={24}/>
                )
                }}/>
            <Tabs.Screen name='Create' options={{
                title: 'Create',
                tabBarIcon: ({color, focused}) => (
                    <Ionicons name={focused ? 'add-circle-sharp' : 'add-circle-outline'} color={color} size={24}/>
                )
                }}/>
            <Tabs.Screen name='Notifications' options={{
                title: 'Notifications',
                tabBarIcon: ({color, focused}) => (
                    <Ionicons name={focused ? 'notifications-sharp' : 'notifications-outline'} color={color} size={24}/>
                )
                }}/>
            <Tabs.Screen name='Settings' options={{
                title: 'Settings',
                tabBarIcon: ({color, focused}) => (
                    <Ionicons name={focused ? 'settings-sharp' : 'settings-outline'} color={color} size={24}/>
                )
                }}/>
            
        </Tabs>
    ) :
    
    (
        <Tabs>
            <Tabs.Screen name='Feed' options={{
                title: 'Feed',
                tabBarIcon: ({color, focused}) => (
                    <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24}/>
                )
                }}/>
           <Tabs.Screen name='Create' options={{
                title: 'Create',
                tabBarIcon: ({color, focused}) => (
                    <Ionicons name={focused ? 'add-circle-sharp' : 'add-circle-outline'} color={color} size={24}/>
                )
                }}/>
            <Tabs.Screen name='Notifications' options={{
                title: 'Notifications',
                tabBarIcon: ({color, focused}) => (
                    <Ionicons name={focused ? 'notifications-sharp' : 'notifications-outline'} color={color} size={24}/>
                )
                }}/>
            <Tabs.Screen name='Settings' options={{
                title: 'Settings',
                tabBarIcon: ({color, focused}) => (
                    <Ionicons name={focused ? 'settings-sharp' : 'settings-outline'} color={color} size={24}/>
                )
                }}/>
            
        </Tabs>
    )
}