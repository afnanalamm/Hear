import { useAuthentication } from "@/components/AuthenticationContext";
import { server } from "@/components/serverConfig";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, Image, Pressable, RefreshControl, StyleSheet, Text, TextInput, View, Share } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function SuperFeed(){ 
  // setting all the required states
  const [posts, setPosts] = useState([]); // dynamic array to hold posts fetched from server
  const [refreshing, setRefreshing] = useState(false);
  // the useAuthentication hook provides access to the context values for each of the JWT auth functions
  const { onFetchAllPosts } = useAuthentication();
  const { onModeratePost } = useAuthentication();

  
  const today = new Date();
  

  useEffect(() => {
    getAllPosts();
  }, []);   

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


  // Handle approve/reject action
const handleModeration = async (postID, action) => {
  try {
    const response = await onModeratePost(postID, action)

    if (response.status !== 200) {
      throw new Error(response.data?.message)
    }

    setPosts(prev =>
      prev.map(p =>
        p.postID === postID
          ? { ...p, approvalStatus: response.data.approvalStatus }
          : p
      )
    )
  } catch (error) {
    Alert.alert(error.message || "Moderation failed")
  }
}


// FlatList is returned

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <PostCard item={item} onModeratePost={handleModeration} />
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

// PostCard component — SUPERUSER VERSION
// Replaces Agree / Disagree with Approve / Reject
// Assumes approvalStatus is provided by backend
// Assumes onModeratePost is passed from parent

const PostCard = ({ item, onModeratePost }) => {
  const mediaURL = item.mediaURL
    ? `${server}/uploads/${encodeURIComponent(item.mediaURL)}`
    : null;

  // Comments logic (unchanged from citizen feed)
  const { onFetchAllComments, onCreateComment } = useAuthentication();

  const [allComments, setAllComments] = useState([]);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [comment, setComment] = useState("");

  const getAllComments = async () => {
    try {
      const response = await onFetchAllComments(item.postID);

      if (response.status !== 200) {
        throw new Error(response.data?.message || "Failed to fetch comments");
      }

      setAllComments(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "Could not load comments.");
    }
  };

  const handleComment = async () => {
    if (comment.trim() === "") {
      Alert.alert("Comment cannot be empty.");
      return;
    }

    const commentData = {
      postID: item.postID,
      commentText: comment,
    };

    try {
      const response = await onCreateComment(commentData);

      if (response.status !== 200) {
        throw new Error(response.data?.message || "Commenting failed");
      }

      setComment("");
      getAllComments(); // refresh comments after posting
    } catch (error) {
      console.error(error);
      Alert.alert(error.message || "Commenting failed.");
    }
  };

  const handleShare = async () => {
    try {
      const hostIP = "192.168.1.180"; // or whatever the actual IP address is
      const deepLink = `exp://${hostIP}:8081/feed`; 
      // need to add proper deeplinking in the future

      const message =
        `
        Title: ${item.title.split("__", 1)[0]}
        User: ${item.username}

        Description: ${item.description}

        Post Type: ${item.postType}
        Location: ${item.location}
        Tags: ${item.tags || 'none'}

        Open in Hear:
        ${deepLink}`;

      await Share.share(
        {
          message,
        },
        {
          dialogTitle: `Share ${item.postType}`,
        }
      );
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Error", "Could not share this post.");
    }
  };

  return (
    <View style={styles.PostCard}>
      {/* COMMENTS MODAL */}
      <Modal
        animationType="slide"
        transparent
        visible={commentsModalVisible}
        onRequestClose={() => setCommentsModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setCommentsModalVisible(false)}
            >
              <Ionicons name="close" size={30} color="white" />
            </Pressable>

            <Text style={styles.modalTitle}>Comments</Text>

            <FlatList
              data={allComments}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Text style={styles.commentUser}>
                    {item.username || "Anonymous"}:
                  </Text>
                  <Text style={styles.commentText}>{item.commentText}</Text>
                </View>
              )}
              keyExtractor={(item) =>
                item.commentID?.toString() || Math.random().toString()
              }
              ListEmptyComponent={
                <Text style={styles.emptyText}>No comments yet.</Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* USER HEADER */}
      <View style={styles.horizontalMultiplexContainer}>
        <Ionicons name="person-circle" size={40} color="#000" />
        <View>
          <Text style={{ fontWeight: "bold" }}>{item.username}</Text>
          <Text style={{ color: "gray" }}>from {item.location}</Text>
        </View>
      </View>

      {/* TITLE */}
      <Text style={styles.title}>
        {item.title?.split("__", 1)[0]}
      </Text>

      {/* META */}
      <Text style={{ color: "gray", marginVertical: 4 }}>
        Posted {new Date(item.createdOn).toLocaleDateString()}
      </Text>

      {/* IMAGE */}
      <Image
        source={
          mediaURL
            ? { uri: mediaURL }
            : require("@/assets/icons/placeholder.png")
        }
        style={styles.image}
      />

      {/* CONTENT */}
      <Text style={{ marginVertical: 8 }}>{item.description}</Text>
      <Text>
        <Text style={{ fontWeight: "600" }}>Type:</Text> {item.postType}
      </Text>

      {item.deadline && (
        <Text>
          <Text style={{ fontWeight: "600" }}>Deadline:</Text> {item.deadline}
        </Text>
      )}

      {item.tags && (
        <Text>
          <Text style={{ fontWeight: "600" }}>Tags:</Text> {item.tags}
        </Text>
      )}

      {/* APPROVAL STATUS */}
      <Text style={{ marginTop: 8, fontWeight: "600" }}>
        Status: {item.approvalStatus?.toUpperCase()}
      </Text>
      
      {/* NUMBER AGREED */}
      <View style={[styles.horizontalMultiplexContainer, {justifyContent: 'space-around'}]}>
        <Text style={[styles.pressableButton, {marginTop: 8, marginBottom: 8, fontWeight: "800" }]}>
          Agreed: {item.agreeCount}
        </Text>
        {/* NUMBER DISAGREED*/}
        <Text style={[styles.pressableButton, {marginTop: 8, marginBottom: 8, fontWeight: "800" }]}>
          Disagreed: {item.disagreeCount}
        </Text>
      </View>

      {/* SUPERUSER MODERATION CONTROLS */}
      {item.approvalStatus === "pending" && (
        <View style={styles.AgreeDisagreeContainer}>
          <Pressable
            style={[styles.pressableButton, { backgroundColor: "#4CAF50" }]}
            onPress={() => onModeratePost(item.postID, "approve")}
          >
            <Ionicons name="checkmark" size={18} color="white" />
            <Text style={{ marginLeft: 6, color: "white" }}>
              Approve
            </Text>
          </Pressable>

          <Pressable
            style={[styles.pressableButton, { backgroundColor: "#ff4444cc" }]}
            onPress={() => onModeratePost(item.postID, "reject")}
          >
            <Ionicons name="close" size={18} color="white" />
            <Text style={{ marginLeft: 6, color: "white" }}>
              Reject
            </Text>
          </Pressable>
        </View>
      )}

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
              <Ionicons  name="send" size={20} color="#007AFF" />
            </Pressable>
          </View>
          <Pressable 
            onPress={() => {
              getAllComments();
              setCommentsModalVisible(true);
            }}
            style={styles.pressableButton}>
            <Ionicons name="chatbubbles" size={16} color="#333" />
            {/* <Ionicons name="chevron-down" size={16} color="#333" /> */}
          </Pressable>

          <Pressable
            style={styles.pressableButton}
            onPress={handleShare}>
            <Ionicons name="share-social" size={18} color="black" />
          </Pressable>

        
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