import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Pressable, Image, Button, ScrollView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import PostTypeSwitch from "@/components/PostTypeSwitch";
import DateTimePicker from '@react-native-community/datetimepicker';
// import { ScrollView } from 'react-native-web';

// DateTimePickerAndroid.open({
//   value: new Date(1598051730000),
//   onChange: (event, selectedDate) => {}
// })
// DateTimePickerAndroid.dismiss();

export default function Details() {
  const [date, setDate] = useState(new Date(1598051730000));
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
          is24Hour={true}
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
          onChange={onChange} 
        />
        </>
      )}

      </View>
      </View>

      <TextInput
        style={styles.textInput}
        placeholder=' Name the area impacted'
        padding = '1'
      />
      <TextInput
        style={styles.textInput}
        placeholder=' Add some tags'
        padding = '1'
      />

      <Pressable style={styles.pressablePostButton}>
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