import { StyleSheet, Text, View, Pressable, TextInput } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import React, {useState} from 'react'
import { Link, router } from 'expo-router'
import * as Crypto from 'expo-crypto';
import { server } from '../components/serverConfig';


export default function SignIn() {
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    // console.log('Sign In button pressed');
    // router.replace('/(tabs)/Feed');
    let required_fields = [emailAddress, password];
    if (required_fields.some(field => field === '')) {
      alert('Please fill in all fields.');
    }

    const passwordHash = Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, password)

    const loginData = {
      emailAddress : emailAddress,
      passwordHash : passwordHash
    }

    try {
      const url = server + `/check_login`;
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      };
      const response = await fetch(url, options);
      if (response.status !== 200){
        const data = await response.json();
        console.log(data.message);
        alert(data.message);
      } else {
        alert("Logged In!");
        console.log(`User ${emailAddress} has signed in`);

      }

    } catch (error) {
      alert(`Error: ${error.message}`);
    }

    const url = server + `/check_login`;
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      };
      const response = await fetch(url, options);

    if (response.status === 200) {
      router.replace('/(tabs)/Feed');
    }
  };

  
  
  return (
    <SafeAreaProvider>
    <SafeAreaView>

      <Text>Hear</Text>
      <Text>Log In to start using this app</Text>
      <View>


        <TextInput placeholder='Email or Username' value={emailAddress} onChangeText={setEmailAddress}
        placeholderTextColor={'grey'}
        style={{borderWidth: 1, borderColor: 'grey', height: 40}}/>

        <TextInput placeholder='Password' value={password} onChangeText={setPassword}
        placeholderTextColor={'grey'}
        style={{borderWidth: 1, borderColor: 'grey', height: 40}}/>

        <Pressable style={styles.button} onPress={handleSignIn}>
          <Text>Sign In</Text>
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