import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";


export default function TabLayout() {
    return (
        <Tabs>
        {/* <Tabs screenOptions={{ tabBarStyle: { display: 'none' } }}> */}
            <Tabs.Screen name='SuperFeed' 
            options={{
                title: 'SuperFeed',
                headerShown: false,
                tabBarIcon: ({color, focused}) => (
                    <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24}/>
                )
                }}/>
            <Tabs.Screen name='SuperMap' options={{
                title: 'SuperMap',
                tabBarIcon: ({color, focused}) => (
                    <Ionicons name={focused ? 'map-sharp' : 'map-outline'} color={color} size={24}/>
                )
                }}/>
            <Tabs.Screen name='SuperNotifications' options={{
                title: 'SuperNotifications',
                tabBarIcon: ({color, focused}) => (
                    <Ionicons name={focused ? 'notifications-sharp' : 'notifications-outline'} color={color} size={24}/>
                )
                }}/>
            <Tabs.Screen name='SuperSettings' options={{
                title: 'SuperSettings',
                tabBarIcon: ({color, focused}) => (
                    <Ionicons name={focused ? 'settings-sharp' : 'settings-outline'} color={color} size={24}/>
                )
                }}/>
            
        </Tabs>
    )
}