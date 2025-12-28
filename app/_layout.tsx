import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { AuthenticationProvider } from '@/components/AuthenticationContext';

export default function RootLayout() {

  
    
  return (
    <AuthenticationProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="SignIn" options={{ headerShown: true}} />
            <Stack.Screen name="SignUp" options={{ headerShown: true}} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthenticationProvider>
  );
}
 

/**
 * RootLayout component sets up the main navigation stack for the application.
 * 
 * The root stack navigator with the tab screens.
 * 
 * - Uses a Stack navigator to manage screen transitions.
 * - The "(tabs)" screen is rendered without a header.
 * - This component serves as the entry point for the app's navigation structure.
 */
