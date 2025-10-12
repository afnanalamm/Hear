import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, StyleSheet, RefreshControl, Pressable } from "react-native";
import { server } from "@/components/serverConfig";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Button } from "@react-navigation/elements";

export default function App(){
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  

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
    
    
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard item={item} />}
        keyExtractor={(item) => item.postID.toString()}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
      />
    </SafeAreaView>
    </SafeAreaProvider>
  );
};

const PostCard = ({ item }) => {
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
        <Pressable style={styles.pressableButton}>
          <Text>Agree</Text>
        </Pressable>

        <Pressable style={styles.pressableButton}>
          <Text>Disagree</Text>
        </Pressable>
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
    margin: 15,
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
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  title: {
    color: "black",
    fontSize: 20,
  },
  image: {
  width: '100%',      // or a fixed value like 200
  height: 200,
  resizeMode: 'cover', // or 'contain' depending on your design
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


// // Grok modified FULL VERSION start here, added auto refresh and pull-to-refresh after a set interval

// import React, { useEffect, useState } from "react";
// import { View, Text, Image, FlatList, StyleSheet, RefreshControl } from "react-native";
// import { server } from "@/components/serverConfig";
// import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

// export default function App() {
//   const [posts, setPosts] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);

//   useEffect(() => {
//     getAllPosts(); // Initial fetch on mount
//   }, []);

//   // Auto-refresh every 5 seconds
//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       getAllPosts(); // Fetch posts without triggering refresh indicator
//     }, 5000);

//     // Cleanup interval on component unmount
//     return () => clearInterval(intervalId);
//   }, []);

//   const getAllPosts = async (isRefresh = false) => {
//     try {
//       if (isRefresh) setRefreshing(true); // Only set refreshing for pull-to-refresh
      
//       // Add custom timeout to fetch
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
      
//       const response = await fetch(`${server}/allposts`, {
//         signal: controller.signal,
//       });
//       clearTimeout(timeoutId); // Clear timeout if request succeeds
      
//       const posts = await response.json();
//       setPosts(posts);
//     } catch (error) {
//       console.error("Fetch error:", error.message);
//       if (error.name === 'AbortError') {
//         console.error("Request timed out after 10 seconds");
//       }
//     } finally {
//       if (isRefresh) setRefreshing(false); // Always clear refreshing state
//     }
//   };

//   const onRefresh = () => {
//     getAllPosts(true); // Trigger fetch with refresh flag
//   };

//   return (
//     <SafeAreaProvider>
//       <SafeAreaView style={{ flex: 1 }}>
//         <FlatList
//           data={posts}
//           renderItem={({ item }) => <ProductCard item={item} />}
//           keyExtractor={(item) => item.id.toString()}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         />
//       </SafeAreaView>
//     </SafeAreaProvider>
//   );
// }

// const ProductCard = ({ item }) => {
//   return (
//     <View style={styles.productCard}>
//       <Text style={styles.title}>{item.username}</Text>
//       <Text>Description: {item.description}</Text>
//       <Text>Location: {item.location}</Text>
//       <Text>This is a: {item.postType}</Text>
//       <Text>Deadline to make change: {item.date}</Text>
//       <Text>Tags added: {item.tags}</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   productCard: {
//     backgroundColor: "white",
//     borderWidth: 0.5,
//     borderColor: "gray",
//     elevation: 20,
//     padding: 10,
//     margin: 15,
//     borderRadius: 10,
//   },
//   title: {
//     color: "black",
//     fontSize: 20,
//   },
// });