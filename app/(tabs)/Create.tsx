import { Text, View, StyleSheet } from "react-native"; // importing commonly used components from "react-native" library
import { Link } from "expo-router"; // importing the Link component from expo router library
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"; // importing the useSafeAreaInsets hook from react-native-safe-area-context library
import Details from "@/components/Details";


export default function Create() {
    return (
        <SafeAreaProvider>
            

                <Details />

            
        </SafeAreaProvider>
    )
}
