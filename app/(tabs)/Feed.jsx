import { useAuthentication } from "@/components/AuthenticationContext";
import { server } from "@/components/serverConfig";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, Image, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Feed(){ 
  // setting all the required states
  const [posts, setPosts] = useState([]); // dynamic array to hold posts fetched from server
  const [refreshing, setRefreshing] = useState(false);
  // the useAuthentication hook provides access to the context values for each of the JWT auth functions
  const { onFetchAllPosts } = useAuthentication();
  const { onVote } = useAuthentication();
  
  const today = new Date();
  

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

    const response = await onFetchAllPosts();

    // Axios-specific checks
    if (response.status !== 200) {
      throw new Error(response.data?.message || "Failed to fetch posts");
    }

    const posts = response.data;  // Axios already parses JSON, so just use response.data

    // Initialize interaction state for each post after they have been fetched
    const postsWithInteraction = posts.map(post => ({
      ...post,
      // userHasAgreed: false,
      // userHasDisagreed: false,
      agreeCount: post.agreeCount || 0, // if not defined, start at 0
      disagreeCount: post.disagreeCount || 0,
    }));

    setPosts(postsWithInteraction);
  } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "Could not load posts. Please try again.");
  } finally {
      if (isRefresh) setRefreshing(false); // resetting refreshing state after fetch
  }
};

  const onRefresh = () => {
    getAllPosts(true); 
  };


  // Handle Agree/Disagree action
const handleVote = async (postId, action) => {
  try {
    const response = await onVote(postId, action);

    if (response.status !== 200) {
      throw new Error(response.data?.message || "Vote failed");
    }

    const data = response.data;  //The vote endpoint returns counts + userVoteType in response.data

    // now the app should re-render the post so that the user sees the impact they've made
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.postID === postId
          ? {
              ...p,
              agreeCount: data.agreeCount,
              disagreeCount: data.disagreeCount,
              userVoteType: data.userVoteType,
              userHasVoted: data.userHasVoted !== undefined ? data.userHasVoted : true,
            }
          : p
      // This also has best time complexity O(n) & will perform worse with more posts.
      // but it's simpler to implement than maintaining separate states for each post.
      // In the future I might consider using something like Redux or Context API 
      // for better state management.
      )
    );
  } catch (error) {
    console.error("Vote error:", error);
    Alert.alert(error.message || "Vote failed. Please try again.");
  }
};

// FlatList is returned

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <PostCard item={item} onVote={handleVote}/>
          )}
          keyExtractor={(item) => item.postID.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const PostCard = ({ item, onVote}) => {
  const { user } = useAuthentication();
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

  const userVoteType = item.userVoteType; // "agree", "disagree", or null
  const userHasAgreed = userVoteType === "agree";
  const userHasDisagreed = userVoteType === "disagree";

  const { onFetchAllComments } = useAuthentication(); 
  const [allComments, setAllComments] = useState([])
  const [commentsModalVisible, setCommentsModalVisible] = useState(false); // State to control visibility of comments modal

  const [comment, setComment] = useState('') // State to hold the new comment text user is typing
  const { onCreateComment } = useAuthentication(); // use JWT authentication to validate request, identify user and make comment

  const getAllComments = async () => {
    try {
      const response = await onFetchAllComments(item.postID);
      // Axios-specific checks
      if (response.status !== 200) {
        throw new Error(response.data?.message || "Failed to fetch posts");
    }

    const comments = response.data
    setAllComments(comments);
    
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "Could not load comments. Please try again.");
    }
  }

  const handleComment = async () => {
    // Call the onCreateComment function passed as a prop
      if (comment.trim() === "") {
        Alert.alert("Comment cannot be empty.");
        return;
      }
      const timestamp = new Date().getTime();
      const commentData = {
        postID: item.postID,
        createdOn: timestamp,
        commentText: comment
      }
      try {
        const response = await onCreateComment(commentData);
        if (response.status !== 200) {
        throw new Error(response.data?.message || "Commenting failed");
        }
      } catch (error) {
        console.error("Vote error:", error);
        Alert.alert(error.message || "Commenting failed. Please try again.");
      }
  };

  return (
    <View style={styles.PostCard}>

      {/* COMMENT MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentsModalVisible}
        onRequestClose={() => setCommentsModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* Close Button (X) at top-right */}
            <Pressable
              style={styles.closeButton}
              onPress={() => setCommentsModalVisible(false)}
            >
              <Ionicons name="close" size={30} color="white" />
            </Pressable>

            {/* Title */}
            <Text style={styles.modalTitle}>Comments</Text>

            {/* Comments List */}
            <FlatList
              data={allComments}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Text style={styles.commentUser}>{item.userID || 'Anonymous'}:</Text>
                  <Text style={styles.commentText}>{item.commentText}</Text>
                </View>
              )}
              keyExtractor={(item) => item.commentID?.toString() || Math.random().toString()} // safer fallback
              style={styles.commentsList}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No comments yet.</Text>
              }
            />
          </View>
        </View>
      </Modal>

      <View style={styles.horizontalMultiplexContainer}>
        <Ionicons name="person-circle" size={40} color={styles.lightThemeIconColor} />
        <View>
          <Text style={{ fontWeight: "bold" }}>{item.userID}</Text>
          <Text style={{ color: "gray" }}>from {item.location}</Text>
        </View>
      </View>

      <Text style={styles.title}>
        {item.title.split("__", 1)[0]}
      </Text>

      <Text style={{ color: "gray", marginVertical: 4 }}>
        Posted {new Date(item.createdOn).toLocaleDateString()}
      </Text>

      <Image
        source={
          mediaURL
            ? { uri: mediaURL }
            : require('@/assets/icons/placeholder.png')
        }
        style={styles.image}
      />
      <Text style={{ marginVertical: 8 }}>{item.description}</Text>
      <Text><Text style={{fontWeight:'600'}}>Type:</Text> {item.postType}</Text>
      {item.deadline && (
        <Text><Text style={{fontWeight:'600'}}>Deadline:</Text> {item.deadline}</Text>
      )}
      {item.tags && (
        <Text><Text style={{fontWeight:'600'}}>Tags:</Text> {item.tags}</Text>
      )}
      
      <View style={styles.AllInteractions}>
        {/* Agree / Disagree Buttons */}
        <View style={styles.AgreeDisagreeContainer}>
          <Pressable
            style={[
              styles.pressableButton,
              userHasAgreed && styles.buttonPressed,
            ]}
            onPress={() => onVote(item.postID, "agree")}
            // disabled={hasVoted} // button is disabled if user has already voted.
            // look above for hasVoted declaration
          >
            <Ionicons name="thumbs-up" size={18} color={userHasAgreed ? "white" : "black"} />
            <Text style={{ marginLeft: 5, color: userHasAgreed ? "white" : "black" }}>
              {agreeButtonText}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.pressableButton,
              userHasDisagreed && styles.buttonPressed,
              { backgroundColor: "#ff4444cc" },
            ]}
            onPress={() => onVote(item.postID, "disagree")}
            // disabled={hasVoted}
          >
            <Ionicons name="thumbs-down" size={18} color={userHasDisagreed ? "white" : "black"} />
            <Text style={{ marginLeft: 5, color: userHasDisagreed ? "white" : "black" }}>
              {disagreeButtonText}
            </Text>
          </Pressable>
        </View>

        {/* Vote Counts */}
        <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 8 }}>
          <Text style={{ fontWeight: userHasAgreed ? "bold" : "normal" }}>
            {agreeCounterText}: {item.agreeCount}
          </Text>
          <Text style={{ fontWeight: userHasDisagreed ? "bold" : "normal" }}>
            {disagreeCounterText}: {item.disagreeCount}
          </Text>
        </View>

        {/* Comment Section */}
        <View style={styles.horizontalMultiplexContainer}>
          <View style={styles.CommentsEntry}>
            <TextInput
              placeholder="Leave a comment..."
              placeholderTextColor="grey"
              value={comment}
              onChangeText={setComment}
              style={{ flex: 1, padding: 8 }}
            />
            <Pressable
              onPress={handleComment}
              >
              <Ionicons name="send" size={20} color="#007AFF" />
            </Pressable>
          </View>

          <Pressable 
            onPress={() => {
              getAllComments();
              setCommentsModalVisible(true);


            }}
            style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="chatbubbles" size={20} color="#333" />
            <Ionicons name="chevron-down" size={20} color="#333" />
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
  PostCard: {
    backgroundColor: "white",
    borderRadius: 12,
    margin: 10,
    padding: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  centeredView: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.7)', // Clean dark overlay
},
  modalView: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
  },
  commentsList: {
    width: '100%',
    flex: 1,
  },
  commentItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  commentUser: {
    fontWeight: '600',
    color: '#007AFF',
  },
  commentText: {
    marginTop: 4,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginTop: 50,
  },
  horizontalMultiplexContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  AllInteractions: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
  },
  AgreeDisagreeContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 10,
  },
  CommentsEntry: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 6,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: "#eee",
  },
  pressableButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "#ffee00cc",
    elevation: 3,
  },
  buttonPressed: {
    backgroundColor: "#4CAF50",
  },
});