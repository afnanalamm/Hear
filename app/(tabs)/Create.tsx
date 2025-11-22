// importing necessary modules
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Details from "@/components/Details";

export default function Create() {
// I'm creating the main tab component, with all the functionallity inside Details component
// Details component handles the creation of new posts, and is imported from components/Details.tsx
// This is to keep the code modular and organized, 
// And add anyitional functionality to the either the Tab or Details file independently

    return (
        <SafeAreaProvider>
            <Details/>
        </SafeAreaProvider>
    )
}
