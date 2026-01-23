import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import SuperSettingsSectionsList from "@/components/SettingsSectionsList";

export default function SuperSettings() { 
// main settings screen component, 
// which uses SafeAreaProvider and SafeAreaView to ensure content is displayed within safe areas of the device
// It renders the SettingsSectionsList component that displays the actual settings options

    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <SuperSettingsSectionsList/>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}