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
    if (!emailAddress || !password){
      alert("Please fill in all fields.");
      return;
    }
    
    
    try {
      const passwordHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );


      const loginData = {
        emailAddress : emailAddress,
        passwordHash : passwordHash
      }
      const url = server + `/check_login`;
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      };

      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network error: Request timed out')), 5000)
      );

      
      const response = await Promise.race([
        fetch(url, options),
        timeoutPromise
      ]);

      // const response = await fetch(url, options);
      const data = await response.json();
      if (response.status === 200) {
        console.log(`User ${emailAddress} has signed in`);
        alert('Logged In!');
        router.replace('/(tabs)/Feed');
      } else {
        console.log(data.message);
        alert(data.message || 'Login failed');
      }

    } catch (error) {
      console.error('Login error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Hear</Text>
        <Text style={styles.subtitle}>Log In to start using this app</Text>
        <View style={styles.form}>
          <TextInput
            placeholder="Email or Username"
            value={emailAddress}
            onChangeText={setEmailAddress}
            placeholderTextColor="grey"
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="grey"
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
          />
          <Pressable style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Sign In</Text>
          </Pressable>
          <View style={styles.links}>
            <Pressable onPress={() => router.replace('/SignUp')}>
              <Text style={styles.linkText}>Create new account</Text>
            </Pressable>
            <Pressable>
              <Text style={styles.linkText}>Forgotten Password?</Text>
            </Pressable>
          </View>
          <View style={styles.divider} />
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.buttonText}>Continue with Google</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.buttonText}>Continue with Apple</Text>
          </Pressable>
          <Text style={styles.terms}>
            By continuing, you agree to our{' '}
            <Link href="https://codeshare.io/heart&cs">Terms of Service</Link> and{' '}
            <Link href="https://www.termsfeed.com/live/07eccd2d-48da-442c-8b57-57bffebfe58a">
              Privacy Policy
            </Link>
          </Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'grey', marginBottom: 16 },
  form: { flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: 'grey',
    height: 40,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#e8f40d',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginVertical: 8,
  },
  secondaryButton: {
    backgroundColor: '#787878',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginVertical: 8,
  },
  buttonText: { fontSize: 16, fontWeight: '500' },
  links: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  linkText: { color: '#0056b3', fontSize: 14 },
  divider: { borderBottomWidth: 1, borderColor: 'black', marginVertical: 16 },
  terms: { fontSize: 12, textAlign: 'center', marginTop: 16 },
});