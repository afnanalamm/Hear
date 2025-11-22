import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, StyleSheet, RefreshControl, Pressable, TextInput } from "react-native";
import { server } from "@/components/serverConfig";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Button } from "@react-navigation/elements";

export default function App(){ 
  // setting all the required states
  const [posts, setPosts] = useState([]); // dynamic array to hold posts fetched from server
  const [refreshing, setRefreshing] = useState(false);
  const [numAgree, setNumAgree] = useState(1008250); // starting with placeholder agree/disagree counts
  const [numDisagree, setNumDisagree] = useState(1010);

  

  useEffect(() => {
    getAllPosts();
  }, []);   // The second parameter is a dependency array, which ensures the effect runs only 
            // once when the component mounts. Component mounting on a React Native app is similar
            // to page load on a web app. 
            // I write these comments for my own understanding, btw (to the moderator)
            // Modified parts in App component

  useEffect(() => {
    getAllPosts(); // Initial fetch on mount
  }, []);

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
        renderItem={({ item }) => <PostCard item={item} numAgree={numAgree} />}
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
  const imageURL = item.mediaURL ? `${server}/uploads/${item.mediaURL}` : null;
  return (
    <View style={styles.PostCard}>

      <Text style={styles.title}>
        {item.title.split("__", 1)}
      </Text>
      <Text>Posted {item.createdOn}</Text>

      <Image
        source={
          imageURL
            ? { uri: imageURL }
            : require('@/assets/icons/placeholder.png')
        }
        style={styles.image}
      />
      <Text>{item.userID} from {item.location}</Text>
      <Text>Description: {item.description}</Text>
      <Text>This is a: {item.postType}</Text>
      <Text>Deadline to make change: {item.deadline}</Text>
      <Text>Tags added: {item.tags}</Text>
      
      <View style={styles.AllInteractions}>
        <View style={styles.AgreeDisagreeContainer}>
          <Pressable style={styles.pressableButton}>
            <Text>Agree</Text>
          </Pressable>

          <Pressable style={styles.pressableButton}>
            <Text>Disagree</Text>
          </Pressable>
        </View>
        <Text>{numAgree}</Text>
        <Text>{numDisagree}</Text>

        <View style={styles.CommentsEntry}> 
          <TextInput
            // style={styles.textInput}
            placeholder='Leave a comment...'
            padding='1'
            placeholderTextColor={'grey'}
            // value={}
            // onChangeText={}
            >
          </TextInput>
            

        </View>

      </View>
      

    </View>
  );
};



const styles = StyleSheet.create({
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
    padding: 10,
    margin: 15,
    borderRadius: 10,
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
