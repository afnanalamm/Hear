import { StyleSheet, Text, View, Pressable, TextInput } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import React, {useState} from 'react'
import { Link, router } from 'expo-router'
import * as Crypto from 'expo-crypto';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    console.log('Sign In button pressed');
    router.replace('/(tabs)/Feed');
  };

  return (
    <SafeAreaProvider>
    <SafeAreaView>

      <Text>Hear</Text>
      <Text>Log In to start using this app</Text>
      <View>


        <TextInput placeholder='Email or Username' value={email} onChangeText={setEmail}
        placeholderTextColor={'grey'}
        style={{borderWidth: 1, borderColor: 'grey', height: 40}}/>

        <TextInput placeholder='Password' value={password} onChangeText={setPassword}
        placeholderTextColor={'grey'}
        style={{borderWidth: 1, borderColor: 'grey', height: 40}}/>

        <Pressable style={styles.button} onPress={handleSignIn}>
          <Link href="/(tabs)/Feed">Sign In</Link>
        </Pressable>

        <View>
          <Pressable
            onPress={() => router.replace('/SignUp')}
          >
            <Text>Create new account</Text>
          </Pressable>
          <Pressable>
            <Text>Forgotten Password?</Text>
          </Pressable>
        </View>
        <Text style={{borderBlockColor: 'black', borderWidth:1, height: 1}}> </Text>

        <Pressable style={styles.secondaryButton}>
          <Text>Continue with Google</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton}>
          <Text>Continue with Apple</Text>
        </Pressable>

        <Text>
          By continuing, you agree to our <Link href={'https://codeshare.io/heart&cs'}>Terms of Service</Link> and <Link href={'https://www.termsfeed.com/live/07eccd2d-48da-442c-8b57-57bffebfe58a'}>Privacy Policy</Link>
        </Text>

      </View>

      
    </SafeAreaView>
    </SafeAreaProvider>
  )
}



const styles = StyleSheet.create({

  button: {
    backgroundColor: '#e8f40dff',
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#787878ff',
    paddingVertical: 10,
    alignItems: 'center',
  },
})