import { Text, View, StyleSheet } from "react-native"; // importing commonly used components from "react-native" library
import { Link } from "expo-router"; // importing the Link component from expo router library

export default function Feed() {
    return (
        <View>
            <Text>This is the feed tab</Text>
            <Link href="/Map">Navigate to the Map tab</Link>
            <Link href="/Create">Navigate to the Create tab</Link>
            <Link href="/Notifications">Navigate to the Notifications tab</Link>
        </View>
        
    )
}