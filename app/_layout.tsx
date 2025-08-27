import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
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
