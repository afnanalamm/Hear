import { Text, View, StyleSheet } from "react-native"; // importing commonly used components from "react-native" library
import { Link } from "expo-router"; // importing the Link component from expo router library
import PostContent from "../../components/PostContent"; // importing PostContent component from a relative path
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Feed() {
    return (
        <SafeAreaProvider>
        <SafeAreaView>
            <Text>This is the feed tab</Text>
            <Link href="/Map">Navigate to the Map tab</Link>
            <Link href="/Create">Navigate to the Create tab</Link>
            <Link href="/Notifications">Navigate to the Notifications tab</Link>
        
            <PostContent />
        
        </SafeAreaView>
        </SafeAreaProvider>

        
        
    )
}