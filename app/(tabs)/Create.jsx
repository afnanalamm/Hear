import { server } from '@/components/serverConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework, documentDirectory } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { use, useState } from 'react';
import { Button, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ToggleSwitch from "@/components/ToggleSwitch";
import { userID } from "@/app/SignIn.jsx"

export default function Create() {
  // Declaring form state variables
  const [userID, setUserID] = useState(`${userID}`); 
  const [title, setTitle] = useState(''); // Post title
  const [description, setDescription] = useState('');
  const [postType, setPostType] = useState(''); // 'petition' or 'news post'
  const [mediaURL, setMediaURL] = useState(''); // Placeholder for media file path
  const [uploading, setUploading] = useState(false); // Uploading state, to help show activity indicator (when loading)
  const [media, setMedia] = useState([]); // Array to hold media file URIs
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const today = new Date();
  const timestamp = today.getTime();
  const imgDir = StorageAccessFramework ? '' : documentDirectory + 'images/'; // Directory to store images. This is on phone's file system.


    // Modal and other state variables:
  const [mediaSourceModalVisible, setMediaSourceModalVisible] = useState(false);
  const [previewsFromMedia, setPreviewsFromMedia] = useState([]);
  const [uri, setUri] = useState('');


  // Deadline date picker state variables
  const [deadline, setDeadline] = useState(new Date());
  const [mode, setMode] = useState('deadline');
  const [show, setShow] = useState(false); // this is for showing date picker on Android

  const onChange = (selectedDate) => { // handling date change from date picker
    const currentDate = selectedDate || deadline;
    setShow(false);
    setDeadline(currentDate);
  };

  const showMode = (currentMode) => { // show date picker mode for Android
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('deadline');
  };
  

  // Ensure images directory exists
  const checkDirExists = async () => {
    const dirInfo = await FileSystem.File.info(imgDir);
    
    if (!dirInfo.exists) {
      await FileSystem.Directory.create(imgDir, { intermediates: true });
    }
  };

  // Load images from file system
  const loadMedia = async () => {
    await checkDirExists();
    const files = await FileSystem.Directory.list(imgDir);
    if (files.length > 0) {
      setMedia(files.map((f) => imgDir + f));
    }
  };

  // Save image to file system
  const saveMedia = async (uri, postData) => {
    await checkDirExists();
    const filename = `${postData.title}_media.jpeg`;
    const destination = imgDir + filename;
    await FileSystem.File.copy({ from: uri, to: destination });
    setMedia([...media, destination]);
  };

  // Delete image from file system
  const deleteMedia = async (uri) => {
    // await FileSystem.File.delete(uri);
    setPreviewsFromMedia(previewsFromMedia.filter((i) => i !== uri));
};

  // Select media from library or camera
  const selectMedia = async (useLibrary) => {
    let result;
    const options = {
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    };

    if (useLibrary) {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      result = await ImagePicker.launchImageLibraryAsync(options);
    } else {
      await ImagePicker.requestCameraPermissionsAsync();
      result = await ImagePicker.launchCameraAsync(options);
    }


    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      setPreviewsFromMedia(currentPreviews => [...currentPreviews, selectedUri]);
      // await uploadMedia(result.assets[0].uri);
    }
    setMediaSourceModalVisible(false);
  };

  const renderPreviews = () => {
    return previewsFromMedia.map((uri) => (
      <View key={uri} style={styles.imagePreviewContainer}>
        <Image source={{ uri }} style={styles.imagePreview} />
        <Pressable
          style={styles.deleteButton}
          onPress={() => deleteMedia(uri)}
        >
          <Text style={styles.deleteButtonText}>X</Text>
        </Pressable>
      </View>
    ));
  };

  
  const onSubmit = async () => {
    const timestamp = today.getTime();
    const safeTitle = title.trim().replace(/[^\w]/g, '_');  // Only letters, numbers, underscores
    const uniqueTitle_for_media = `${safeTitle}__${timestamp}`;

    const postData = { // Preparing the data object to send in the request body
      userID: userID,
      title: title,
      uniqueTitle_for_media: uniqueTitle_for_media,
      description: description,
      postType: postType,
      mediaURL: `${uniqueTitle_for_media}_media.jpeg`,
      deadline: deadline,
      location: location,
      tags: tags,
      createdOn: today,
    };

    try {
      const url = server + `/create_post`; // Construct the API endpoint URL (server variable + route)
      
      const options = { // defining request options for the fetch call
          method: "POST",                        // HTTP method
          headers: {
              "Content-Type": "application/json" // Tell server a JSON is being sent
          },
          body: JSON.stringify(postData)         // Convert JS object to JSON string
      }
      const response = await fetch(url, options) // Send request, wait for response

      // Check if the response status indicates success (200 or 201)
      if (response.status !== 201 && response.status !== 200) {
          // If not successful, parse the response body for error message
          const data = await response.json()
          console.log(data.message)   // 
          alert(data.message)         // Logging & showing error on screen for debugging purposes
      } else {
          // If successful, notify user and log the submitted data.
          // To be changed later for privacy; currently I'm doing this for debugging
          alert("Post submitted successfully", postData)
          console.log("Post submitted successfully", postData)
      }
    } catch (error) {
      // Siming handling of network/other errors
      alert(`Error: ${error.message}`);
    }

    if (previewsFromMedia.length > 0) {
      // await uploadMedia(previewsFromMedia[0]); // actual file URI
      const uri = previewsFromMedia[0];
      
      try {
      setUploading(true); // Set uploading state to true to show activity indicator
      const formData = new FormData();
      formData.append('media', {
        uri: uri,
        name: `${uniqueTitle_for_media}_media.jpeg`, // Naming the file with the unique title
        type: 'image/jpeg',
      });

      const response = await fetch(`${server}/upload_media`, { // uploading media to server
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMediaURL(data.url || uri);
        alert('Media uploaded successfully!');
        console.log('Uploaded media URL:', data.url);
      } else {
        alert('Upload failed: ' + (data.message || response.statusText));
      }
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }

  }
};


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ width: '95%', alignSelf: 'center' }}>

        <Modal
          animationType="slide"
          transparent={true}
          visible={mediaSourceModalVisible}
          
          onRequestClose={() => setMediaSourceModalVisible(false)} 

          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setMediaSourceModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>X</Text>
                </Pressable>
                
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => {
                    setMediaSourceModalVisible(false);
                    selectMedia(true);
                  }}>
                  <Text style={styles.textStyle}>Pick from gallery</Text>
                </Pressable>

                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => {
                    setMediaSourceModalVisible(false);
                    selectMedia(false);
                  }}>
                  <Text style={styles.textStyle}>Take a photo</Text>
                </Pressable>

            </View>
          </View>
        </Modal>

        <View style={styles.verticalMultiplexContainer}> 
          {/* Creating a temporary usernmae text input box, for testing purposes.
          When the system can properly handle session management, this will be removed.
          For now, this allows me to "show" different users creating posts by changing
          just the username.
          The verticalMultiplexContainer is way to organize component containers that are
          to be distributed vertically. Multiplex essentially means containing multiple items.
          There is another horizontalMultiplexContainer for horizontal distribution. */}

          <TextInput
            style={styles.textInput}
            placeholder=' Username?'
            padding='1'
            placeholderTextColor={'grey'}
            value={userID}  // the state variable holding the input value
            onChangeText={setUserID} // the function to update the state variable
          />

          <TextInput
            style={styles.textInput} // Post title input
            placeholder=' Post Title?'
            padding='1'
            placeholderTextColor={'grey'}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.subheadingText}>Descriptions</Text> 
          {/* Description input field */}
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
          <ToggleSwitch
            value={postType === 'News Post'}
            onValueChange={(value) => {
              setPostType(value ? 'News Post' : 'Petition');
            }}
          />
          <Text>News Post</Text>
        </View>

        <View style={styles.verticalMultiplexContainer}>
          {/* Adding the upload media button */}

        <Text style={styles.subheadingText}>Add Media</Text>
         <View style={styles.selectedMediaContainer}>
            <Pressable style={styles.addMediaButton} onPress={() => setMediaSourceModalVisible(true)}>
              <Image source={require('@/assets/icons/file_picker_light.png')} style={styles.addMediaIcon} />
            </Pressable>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator
              contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 5 }}
              style={{ height: 60, marginLeft: 10 }}
            >
              {renderPreviews()}
            </ScrollView>
          </View>
        </View>

        <View style={styles.horizontalMultiplexContainer}> 
          {/* // Creating the datepicker for Android */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {Platform.OS === 'android' && (
              <>
                <Button onPress={showDatepicker} title="Select Deadline" />
                <Text style={styles.subheadingText}>
                  {deadline instanceof Date ? deadline.toDateString() : ''}
                </Text>

                {show && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={deadline}
                    mode={mode}
                    onChange={onChange}
                  />
                )}
              </>
            )}
            {/* // Creating the datepicker for iOS */}
            {Platform.OS === 'ios' && (
              <>
                <Pressable style={styles.pressableButton}>
                  <Text>Set Deadline</Text>
                </Pressable>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={deadline}
                  is24Hour={true}
                  display='compact'
                  onChange={onChange}
                />
              </>
            )}
          </View>
        </View>

        <TextInput 
        // Plaintext input for location, as temporary solution
  
          style={styles.textInput}
          placeholder='Name the area impacted'
          padding='1'
          placeholderTextColor={'grey'}
          value={location}
          onChangeText={setLocation}
        />
        <TextInput  // Plaintext input for location, as temporary solution
          style={styles.textInput}
          placeholder=' Add some tags...'
          padding='1'
          placeholderTextColor={'grey'}
          value={tags}
          onChangeText={setTags}
        />

        <Pressable style={styles.pressablePostButton} onPress={onSubmit}> 
          {/* Submit post button */}
          <Text>Post!</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    padding: 5,
  },
  subheadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
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
  
  pressableFilePicker: {
    borderRadius: 5,
    backgroundColor: '#b8b8b8ff',
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
  selectedMediaContainer: {
    flexDirection: 'row',
    // flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 10,
  },
  addMediaButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    // marginRight: 5,
  },
  addMediaIcon: {
    width: 40,
    height: 40,
  },
  imagePreviewContainer: {
    position: 'relative',
    margin: 5,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  deleteButton: {
    position: 'absolute',
    top: 1,
    right: -5,
    backgroundColor: 'rgba(255, 0, 0, 1)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cancelButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 0, 0, 1)',
    borderRadius: 10,
    width: 40,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
  },
  centeredView: {
    
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2f2f2fe7',
    
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 50,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#0000003c',
    shadowColor: '#000000ff',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    margin: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: 'white',
  },
});
