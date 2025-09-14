import { StyleSheet, Text, View, TextInput, Pressable } from 'react-native'
import { useState } from 'react'


export default function PostContent() {
  const [text, setText] = useState('')
  const onChangeText = (text) => setText(text);
  

  const onPressPost = async () => {
    const response = await fetch('http://192.168.1.199:5000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      ;
  }

  return (
    <View>
      <TextInput
          style={{
            borderColor: 'black', 
            borderWidth: 1,
            width: '50%',
            padding: 10, 
            margin: 10
          }}
          onChangeText={onChangeText}
          value={text}
      />
      <Text>{text}</Text>
      <Pressable style={styles.pressablePostButton}
        onPress={onPressPost}>
              <Text>Post!</Text>
      </Pressable>



    </View>
  )

  
  
}




const styles = StyleSheet.create({
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
})


const response = await fetch('http://192.168.1.199:5000', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        })
        .then((response) => response.json())
        .then((data) => {
          console.log('Success:', data);
        })
        .catch((error) => {
          console.error('Error:', error);
        })
        ;