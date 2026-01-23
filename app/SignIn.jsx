import { useAuthentication } from '@/components/AuthenticationContext';
import * as Crypto from 'expo-crypto';
import { Link, router } from 'expo-router';
import { jwtDecode } from "jwt-decode";
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { server } from '../components/serverConfig';


export default function SignIn() {
  // State hooks to store user input
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const { onLogin } = useAuthentication();


  // Function triggered when Sign In button is pressed
  const handleSignIn = async () => {
    if (!emailAddress || !password){
      alert("Please fill in all fields.");
      return;
    }
    
    
    try { 
      const passwordHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256, password);
        // Hashing the password using SHA-256


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

      // Setting a network timeout for the fetch request to avoid hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network error: Request timed out')), 5000) // 5 secs
      );

      
      const response = await Promise.race([ 
        onLogin(emailAddress, passwordHash),
        timeoutPromise
      ]);
      // The purpose of Promise.race here is to ensure that 
      // if the fetch request takes too long (exceeds 5 seconds), 
      // the timeoutPromise will reject first, triggering the catch block.

      // Preparing to handle the server response
      const data = await response.data; // Parsing JSON response from server
      if (response.status === 200) {
        const token = response.data.access_token;
        const decodedToken = jwtDecode(token);
        const isSuperuser = response.data.additional_claims?.isSuperuser;

        
        console.log("Decoded token: ", decodedToken);
        console.log("Is superuser? ", isSuperuser);

        if (isSuperuser === "true") {
          console.log(`User ${emailAddress} has signed in`);
          alert('Logged In!');
          router.replace('/(superuser-tabs)/SuperFeed');
        }
        else if (isSuperuser === "0") {
          console.log(`User ${emailAddress} has signed in`);
          alert('Logged In!');
          router.replace('/(tabs)/Feed');
        }
        else {
          router.replace('/SignIn');
        }

      } else {
        // console.log();
        alert( 'Login failed');
      }

    } catch (error) { // Executed if fetch fails or times out
      console.error('Login error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>

        {/* App title and subtitle */}
        <Text style={styles.header}>Hear</Text>
        <Text style={styles.subtitle}>Log In to start using this app</Text>
        <View style={styles.form}>
          {/* Email / Username input field */}
          <TextInput
            placeholder="Email or Username"
            value={emailAddress}
            onChangeText={setEmailAddress}
            placeholderTextColor="grey"
            style={styles.input}
            autoCapitalize="none"
          />
          {/* Password input field */}
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="grey"
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
          />
          {/* Sign In button */}
          <Pressable style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Sign In</Text>
          </Pressable>
          <View style={styles.links}>
            {/* Navigation to Sign Up screen */}
            <Pressable onPress={() => router.replace('/SignUp')}>
              <Text style={styles.linkText}>Create new account</Text>
            </Pressable>
            {/* Placeholder for password recovery */}
            <Pressable>
              <Text style={styles.linkText}>Forgotten Password?</Text>
            </Pressable>
          {/* Divider line */}
          </View>
          <View style={styles.divider} />
          {/* Social login buttons */}
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.buttonText}>Continue with Google</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.buttonText}>Continue with Apple</Text>
          </Pressable>
          {/* Terms and Privacy Policy links */}
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

// All the styles used in this component
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

