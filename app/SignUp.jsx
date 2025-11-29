import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Button } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Crypto from 'expo-crypto';
import { server } from '../components/serverConfig';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SignUp() {
  const [firstName, setFirstName] = useState('a');
  const [lastName, setLastName] = useState('a');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [emailAddress, setEmailAddress] = useState('a');
  const [contactNumber, setContactNumber] = useState('a');
  const [password, setPassword] = useState('a');
  const [confirmPassword, setConfirmPassword] = useState('a');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [postCode, setPostCode] = useState('');
  const [country, setCountry] = useState('');


  const superUser = false;
  // const today = new Date();

  const [mode, setMode] = useState('date of birth');
  const [show, setShow] = useState(false);

  const onDateOfBirthChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth; // Handle Android cancel. 
    setShow(Platform.OS === 'ios'); // Keep picker open on iOS
    setDateOfBirth(currentDate);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };



  const handleSignUp = async () => {
    const username = `${firstName}${lastName}`; // ${new Date()}
    let required_fields = [firstName, lastName, dateOfBirth, contactNumber, emailAddress, password];
    if (required_fields.some(field => field === '')) {
      alert('Please fill in all fields.');
    }

    if (password !== confirmPassword) {
      alert(`Passwords do not match!`);
    }

    const passwordHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );

    console.log(passwordHash);

    const newAccountData = {
      firstName: firstName,
      lastName: lastName,
      username: username,
      dateOfBirth: dateOfBirth,
      emailAddress: emailAddress,
      contactNumber: contactNumber,
      passwordHash: passwordHash,
      addressLine1: addressLine1,
      addressLine2: addressLine2,
      city: city,
      postCode: postCode,
      country: country,
      superUser: superUser,
      // createdOn: today,
    };

    try {
      const url = server + `/create_account`;
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAccountData),
      };
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network error: Request timed out')), 5000)
      );

      const fetchPromise = fetch(url, options);

      const response = await Promise.race([fetchPromise, timeoutPromise]);
      if (response.status !== 201 && response.status !== 200) {
        const data = await response.json();
        console.log(data.message);
        alert(data.message);
      } else {
        alert(`Account created successfully! Please log in to continue.`);
        console.log('Account created successfully', newAccountData);
        redirectToSignIn();
      }
        } catch (error) {
      alert(`Error: ${error.message}`);
        }
    

  };

  const redirectToSignIn = () => {
    router.replace('/SignIn');
  };

  const renderInput = (placeholder, value, onChangeText, secureTextEntry = false) => (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="grey"
      secureTextEntry={secureTextEntry}
      style={styles.input}
    />
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Start Hearing</Text>
        <ScrollView style={styles.section}>
          <Text style={styles.title}>Activate your account</Text>
          <Text style={styles.subtitle}>
            Request activation to start using this app
          </Text>

          <Text style={styles.label}>Personal Information</Text> {/* start of personal info fields*/}
          {renderInput('First Name', firstName, setFirstName)}
          {renderInput('Last Name ', lastName, setLastName)}
          
          <View style={styles.horizontalMultiplexContainer} >
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>

            {Platform.OS === 'android' && (
            <>
              <Button onPress={showDatepicker} title="Date of Birth" />
              <Text style={styles.subheadingText}>{dateOfBirth.toLocaleDateString()}</Text>
              {show && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={dateOfBirth}
                  mode={mode}
                  // is24Hour={true}
                  onChange={onDateOfBirthChange}
                />
              )}
              </>
              )}
          
            { Platform.OS === 'ios' && (
              <>
              <Pressable style={styles.pressableButton}><Text>Date of Birth</Text></Pressable>
              <DateTimePicker
                testID="dateTimePicker"
                value={dateOfBirth}
                // is24Hour={true}
                mode='date'
                display='compact'
                onChange={onDateOfBirthChange} 
              />
              </>
            )}
            </View>
          </View>

          <Text style={styles.label}>Address</Text> {/* start of address fields*/}
          {renderInput('Address Line 1', addressLine1, setAddressLine1)}
          {renderInput('Address Line 2', addressLine2, setAddressLine2)}
          {renderInput('Post Code', postCode, setPostCode)}
          {renderInput('Country', country, setCountry)}


          <Text style={styles.label}>Login Details</Text> {/* start of login details fields*/}
          {renderInput('Email', emailAddress, setEmailAddress)}
          {renderInput('Phone Number', contactNumber, setContactNumber)}
          {renderInput('Password', password, setPassword, true)}
          {renderInput('Confirm Password', confirmPassword, setConfirmPassword, true)}

          <Pressable style={styles.button} onPress={handleSignUp}>
            <Text>Request your account activation</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={redirectToSignIn}>
            <Text>Log in instead?</Text>
          </Pressable>

          <Text style={styles.disclaimer}>
            By creating an account, you agree to our{' '}
            <Link href="https://codeshare.io/heart&cs">Terms of Service</Link> and{' '}
            <Link href="https://www.termsfeed.com/live/07eccd2d-48da-442c-8b57-57bffebfe58a">
              Privacy Policy
            </Link>
          </Text>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 12,
    color: 'grey',
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'grey',
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#e8f40d',
    paddingVertical: 10,
    alignItems: 'center',
    marginVertical: 6,
    borderRadius: 5,
  },
  disclaimer: {
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
  // Merged styles from the second declaration
  subheadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 0,
    textAlign: 'center',
  },
  verticalMultiplexContainer: {
    width: '100%',
    padding: 5,
    alignItems: 'flex-start',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 10,
    borderRadius: 5,
  },
  textInput: {
    width: '100%',
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 10,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  multilineTextInput: {
    width: '100%',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlignVertical: 'top',
    marginTop: 2,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  horizontalMultiplexContainer: {
    width: '100%',
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 10,
    borderRadius: 5,
  },
  pressableFilePicker: {
    borderRadius: 5,
    backgroundColor: '#0056b3',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressableButton: {
    borderRadius: 5,
    backgroundColor: '#c7c7c7cc',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: 'auto',
    padding: 10,
  },
  pressablePostButton: {
    borderRadius: 5,
    backgroundColor: '#ffee00cc',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: 'auto',
    padding: 10,
  },
});