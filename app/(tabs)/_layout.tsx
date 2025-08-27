import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen name='Feed' options={{ title: 'Feed'}}/>
            <Tabs.Screen name='Map' options={{ title: 'Map'}}/>
            <Tabs.Screen name='Create' options={{ title: 'Create'}}/>
            <Tabs.Screen name='Notifications' options={{ title: 'Notifications'}}/>
            <Tabs.Screen name='Settings' options={{ title: 'Settings'}}/>
            
        </Tabs>
    )
}