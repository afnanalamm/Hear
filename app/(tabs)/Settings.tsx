import { Text, View, Pressable } from "react-native"; // importing commonly used components from "react-native" library
import { Link } from "expo-router"; // importing the Link component from expo router library
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import SettingsSectionsList from "@/components/SettingsSectionsList";

export default function Settings() {
    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <SettingsSectionsList/>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}