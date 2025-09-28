// import { Link, Stack, Tabs } from 'expo-router';
// import { StyleSheet, View } from 'react-native';
// import {'_layout.tsx'} from '@/app/(tabs)/_layout';

// export default function NotFoundScreen() {
//   return (



//     // <>
//     //   <Stack.Screen options={{ title: 'Oops! Not Found' }} />
//     //   <View style={styles.container}>
//     //     <Link href="/(tabs)/Feed" style={styles.button}>
//     //       Return back to the Feed tab!
//     //     </Link>
//     //   </View>
//     // </>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#25292e',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   button: {
//     fontSize: 20,
//     textDecorationLine: 'underline',
//     color: '#fff',
//   },
// });

import { Stack, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useEffect } from 'react';

export default function NotFoundScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/SignIn');
    }, 1);

    return () => clearTimeout(timer); // cleanup if unmounted early
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <View style={styles.container}>
        {/* You could also show a loading text while redirecting */}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
