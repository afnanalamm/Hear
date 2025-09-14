import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Pressable, Image, Button, ScrollView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import PostTypeSwitch from "@/components/PostTypeSwitch";
import DateTimePicker from '@react-native-community/datetimepicker';
import { server } from '@/components/serverConfig';
// import { ScrollView } from 'react-native-web';

// DateTimePickerAndroid.open({
//   value: new Date(1598051730000),
//   onChange: (event, selectedDate) => {}
// })
// DateTimePickerAndroid.dismiss();

export default function Details() {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const username = 'afnanalam';
  const [date, setDate] = useState(new Date(1751375700000));
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const onSubmit = async () => {
    const postData = {
      username: username,
      description: description,
      location: location
    }

    try {
      const url = server + `/create_post`  // + (updating ? `update_post/${existingPost.id}` : "create_post")
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(postData)
        }
        const response = await fetch(url, options)
        if (response.status !== 201 && response.status !== 200) {
            const data = await response.json()
            console.log(data.message)
            alert(data.message)
            
        } else {
            alert("Post submitted successfully", postData)
            console.log("Post submitted successfully", postData)
        }

    } catch (error) {
    alert(`Error: ${error.message}`);
  }

  }



  return (
    <SafeAreaView style={styles.container}>
    <ScrollView style={{width: '95%', alignSelf: 'center'}}>
      <View style={styles.verticalMultiplexContainer}>
        <Text style={styles.subheadingText}>Descriptions</Text>
        <TextInput
          editable
          multiline
          numberOfLines={4}
          style={styles.multilineTextInput}
          placeholder=" Add some description..."
          value={description}
          onChangeText={setDescription}
        />

      
      </View>

      <View style={styles.horizontalMultiplexContainer}>
        <Text>Petition</Text>
        <PostTypeSwitch/>
        <Text>News Post</Text>
      </View>

      <View style={styles.verticalMultiplexContainer}>
        <Text style={styles.subheadingText}>Add Media</Text>
        <View style={styles.horizontalMultiplexContainer}>
          <Pressable style={styles.pressableFilePicker}>
            <Image source={require('@/assets/icons/file_picker_light.png')} style={{width: 50, height: 50}}/>
          </Pressable>
        </View>
      </View>

      <View styles={styles.horizontalMultiplexContainer} >
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>

      {Platform.OS === 'android' && (
      <>
        <Button onPress={showDatepicker} title="Select Deadline" />
        <Text style={styles.subheadingText}>{date.toDateString()}</Text>
      
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          // is24Hour={true}
          onChange={onChange}
        />
      )}
      </>
      )}
      

      { Platform.OS === 'ios' && (
        <>
        <Pressable style={styles.pressableButton}><Text>Set Deadline</Text></Pressable>
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          is24Hour={true}
          display='compact'
          onChange={onChange} 
        />
        </>
      )}

      </View>
      </View>

      <TextInput
        style={styles.textInput}
        placeholder='Name the area impacted'
        padding = '1'
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        style={styles.textInput}
        placeholder=' Add some tags'
        padding = '1'
      />

      <Pressable 
      style={styles.pressablePostButton}
      onPress={onSubmit}
      >
        <Text>Post!</Text>
      </Pressable>

    </ScrollView>  
    </SafeAreaView>
  )
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    // alignItems: 'center',
    padding: 5
  },
  subheadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
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
    marginTop: 10,
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
    backColor: '#0056b3',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressableButton: {

    borderRadius: 5,
    backgroundColor: '#c7c7c7cc',
    color: '#d31b1bff',
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
    color: 'white',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: 'auto',
    padding: 10,
  }

});