import PostTypeSwitch from "@/components/PostTypeSwitch";
import * as ImagePicker from 'expo-image-picker';
import { server } from '@/components/serverConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, Button, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework, documentDirectory } from 'expo-file-system';

// Access StorageAccessFramework like this:

// import { ScrollView } from 'react-native-web';

// DateTimePickerAndroid.open({
//   value: new Date(1598051730000),
//   onChange: (event, selectedDate) => {}
// })
// DateTimePickerAndroid.dismiss();

export default function Details() {
  // Form state variables
  const [userID, setUserID] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [postType, setPostType] = useState(''); // 'petition' or 'news post'
  const [mediaURL, setMediaURL] = useState(''); // Placeholder for media file path
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState([]);
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const today = new Date();
  const timestamp = today.getTime();
  const imgDir = StorageAccessFramework ? '' : documentDirectory + 'images/';

  // Modal and other state variables:
  const [mediaSourceModalVisible, setMediaSourceModalVisible] = useState(false);
  const [previewsFromMedia, setPreviewsFromMedia] = useState([]);
  const [uri, setUri] = useState('');

  // Deadline date picker state variables and functions
  const [deadline, setDeadline] = useState(new Date());
  const [mode, setMode] = useState('deadline');
  const [show, setShow] = useState(false);

  const onChange = (selectedDate) => {
    const currentDate = selectedDate || deadline;
    setShow(false);
    setDeadline(currentDate);
  };

  const showMode = (currentMode) => {
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

  // // Upload media to backend server
  // const uploadMedia = async (uri) => {
  //   try {
  //     setUploading(true);
  //     const formData = new FormData();
  //     formData.append('media', {
  //       uri: uri,
  //       name: `${title}__${timestamp}_media.jpeg`,
  //       type: 'image/jpeg',
  //     });

  //     const response = await fetch(`${server}/upload_media`, {
  //       method: 'POST',
  //       body: formData,
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       setMediaURL(data.url || uri);
  //       alert('Media uploaded successfully!');
  //       console.log('Uploaded media URL:', data.url);
  //     } else {
  //       alert('Upload failed: ' + (data.message || response.statusText));
  //     }
  //   } catch (error) {
  //     alert('Upload failed: ' + error.message);
  //   } finally {
  //     setUploading(false);
  //   }
  // };

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
    const uniqueTitle = `${title}__${timestamp}`;

    const postData = {
      userID: userID,
      title: uniqueTitle,
      description: description,
      postType: postType,
      mediaURL: `${uniqueTitle}_media.jpeg`,
      deadline: deadline,
      location: location,
      tags: tags,
      createdOn: today,
    };

    try {
      const url = server + `/create_post`;
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
      };
      const response = await fetch(url, options);
      if (response.status !== 201 && response.status !== 200) {
        const data = await response.json();
        console.log(data.message);
        alert(data.message);
      } else {
        alert("Post submitted successfully", postData);
        console.log("Post submitted successfully", postData);
      }
      
      
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
    if (previewsFromMedia.length > 0) {
      // await uploadMedia(previewsFromMedia[0]); // actual file URI
      const uri = previewsFromMedia[0];
      
      try {
      setUploading(true);
      const formData = new FormData();
      formData.append('media', {
        uri: uri,
        name: `${uniqueTitle}_media.jpeg`,
        type: 'image/jpeg',
      });

      const response = await fetch(`${server}/upload_media`, {
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
          <TextInput
            style={styles.textInput}
            placeholder=' Username?'
            padding='1'
            placeholderTextColor={'grey'}
            value={userID}
            onChangeText={setUserID}
          />

          <TextInput
            style={styles.textInput}
            placeholder=' Post Title?'
            padding='1'
            placeholderTextColor={'grey'}
            value={title}
            onChangeText={setTitle}
          />

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
          <PostTypeSwitch
            value={postType === 'News Post'}
            onValueChange={(value) => {
              setPostType(value ? 'News Post' : 'Petition');
            }}
          />
          <Text>News Post</Text>
        </View>

        <View style={styles.verticalMultiplexContainer}>
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
          style={styles.textInput}
          placeholder='Name the area impacted'
          padding='1'
          placeholderTextColor={'grey'}
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          style={styles.textInput}
          placeholder=' Add some tags...'
          padding='1'
          placeholderTextColor={'grey'}
          value={tags}
          onChangeText={setTags}
        />

        <Pressable style={styles.pressablePostButton} onPress={onSubmit}>
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
