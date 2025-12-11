import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, StyleSheet, RefreshControl, Pressable, TextInput } from "react-native";
import { server } from "@/components/serverConfig";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Button } from "@react-navigation/elements";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function App(){ 
  // setting all the required states
  const [posts, setPosts] = useState([]); // dynamic array to hold posts fetched from server
  const [refreshing, setRefreshing] = useState(false);
  const [numAgree, setNumAgree] = useState(12343); // starting with placeholder agree/disagree counts
  const [numDisagree, setNumDisagree] = useState(654);

  

  useEffect(() => {
    getAllPosts();
  }, []);   // The second parameter is a dependency array, which ensures the effect runs only 
            // once when the component mounts. Component mounting on a React Native app is similar
            // to page load on a web app. 
            // I write these comments for my own understanding, btw (to the moderator)
            // Modified parts in App component

  const getAllPosts = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); // Only set refreshing for pull-to-refresh  
      const response = await fetch(`${server}/allposts`); // I'll need to change this.
                                                          // Or may work around it later on, to fetch other data.
      
      const posts = await response.json();

      // const mediaResponse = await fetch(`${server}/uploads/${posts.mediaURL}`);
      // const mediaBlob = await mediaResponse.blob();

      setPosts(posts);
    } catch (error) {
      console.error(error);
    } finally {
      if (isRefresh) setRefreshing(false); // resetting refreshing state after fetch
    }
  };

  const onRefresh = () => {
    getAllPosts(true); 
  };

// Modified FlatList in return

  return (
    <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1 }}>
    
    
      <FlatList // FlatList is optimized for large lists of items, more efficient than ScrollView
        data={posts}
        renderItem={({ item }) => <PostCard item={item} numAgree={numAgree} numDisagree={numDisagree} />}
        keyExtractor={(item) => item.postID.toString()}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
      />
    </SafeAreaView>
    </SafeAreaProvider>
  );
};

const PostCard = ({ item, numAgree, numDisagree }) => {
  const mediaURL = item.mediaURL ? `${server}/uploads/${encodeURIComponent(item.mediaURL)}` : null;
  let agreeCounterText, disagreeCounterText; // default counter texts. Declared without any value
  let agreeButtonText = "Agree"; // default button texts
  let disagreeButtonText = "Disagree"; // default button texts

  if (item.postType === "Petition") {
    agreeButtonText = "Sign";
    disagreeButtonText = "Disagree";
    agreeCounterText = "Signed";
    disagreeCounterText = "Disagreed";
  } else if (item.postType === "News Post") {
    agreeCounterText = "Agreed";
    disagreeCounterText = "Disagreed";
  }

  return (
    <View style={styles.PostCard}>
      <View style={styles.horizontalMultiplexContainer}>
        <Ionicons name="person-circle" size={40} color={styles.lightThemeIconColor} />
        <Text>{item.userID} from {item.location}</Text>
      </View>

      <Text style={styles.title}>
        {item.title.split("__", 1)}
      </Text>
      <Text>Posted {item.createdOn}</Text>

      <Image
        source={
          mediaURL
            ? { uri: mediaURL }
            : require('@/assets/icons/placeholder.png')
        }
        style={styles.image}
      />
      <Text>Description: {item.description}</Text>
      <Text>This is a: {item.postType}</Text>
      <Text>Deadline to make change: {item.deadline}</Text>
      <Text>Tags added: {item.tags}</Text>
      
      <View style={styles.AllInteractions}>
        <View style={styles.AgreeDisagreeContainer}>
          <Pressable style={styles.pressableButton}>
            <Text>{agreeButtonText}</Text>
          </Pressable>

          <Pressable style={styles.pressableButton}>
            <Text>{disagreeButtonText}</Text>
          </Pressable>
        </View>
        
        <View>
          <Text>{agreeCounterText}:        {numAgree}</Text> {/*using placeholder agree and disagree values for now*/}
          <Text>{disagreeCounterText}:  {numDisagree}</Text>
        </View>

        <View style={styles.horizontalMultiplexContainer}>
          <View style={styles.CommentsEntry}> {/* start of the view that contains everything related commenting*/}
            <TextInput  // actual comment entry box itself
              // style={styles.textInput}
              placeholder='Leave a comment...'
              padding='1'
              placeholderTextColor={'grey'}
              // value={}
              // onChangeText={}
              >
            </TextInput>

            <Pressable>
              <Ionicons name="send" size={styles.normalIconSize} color={styles.lightThemeIconColor} />  {/*button for posting comment*/}
            </Pressable>
          </View>

          <Pressable> {/* this single pressable acts as the button to show all the comments.*/}
            <Ionicons name="chatbubbles" size={styles.normalIconSize} color={styles.lightThemeIconColor} />
            <Ionicons name="chevron-down" size={styles.normalIconSize} color={styles.lightThemeIconColor} />
          </Pressable>
        </View>        

      </View>
      

    </View>
  );
};



const styles = StyleSheet.create({
  normalIconSize: 20,
  lightThemeIconColor: '#000000',
  darkThemeIconColor: '#ffffff',
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

  PostCard: {
    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: "gray",
    elevation: 20,
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },
  AllInteractions: {
    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: "gray",
    elevation: 1,
    padding: 10,
    margin: 15,
    borderRadius: 10,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'justify-center',
    flex: 1,
    
  },
  AgreeDisagreeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 10,
  },
  CommentsEntry: {

    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: "gray",
    elevation: 1,
    padding: 8,
    margin: 2,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    
  },
  title: {
    color: "black",
    fontSize: 20,
  },
  image: {
  width: '100%',      // or a fixed value like 200
  height: 200,
  resizeMode: 'cover', // or 'contain' depending on the design
  borderRadius: 10,
  marginVertical: 10,
  },
  pressableButton: {
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


});
