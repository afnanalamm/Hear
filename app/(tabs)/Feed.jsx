import { useAuthentication } from "@/components/AuthenticationContext";
import { server } from "@/components/serverConfig";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState, useRef } from "react";
import { Alert, FlatList, Modal, Image, Pressable, RefreshControl, StyleSheet, Text, TextInput, View, Share, InteractionManager } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Feed(){ 
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [speedMbps, setSpeedMbps] = useState(null);
  const [fetchTimeMs, setFetchTimeMs] = useState(null);
  const [renderTimeMs, setRenderTimeMs] = useState(null);
  const [postsCount, setPostsCount] = useState(0);

  const startTimeRef = useRef(null);
  const speedRef = useRef(null);

  const { onFetchAllPosts } = useAuthentication();
  const { onVote } = useAuthentication();

  // Track render time
  useEffect(() => {
    if (posts.length > 0 && startTimeRef.current !== null) {
      InteractionManager.runAfterInteractions(() => {
        const renderTime = Date.now() - startTimeRef.current;
        setRenderTimeMs(renderTime);

        Alert.alert(
          "Load Complete",
          `Posts fetched: ${postsCount}\nFetch time: ${fetchTimeMs}ms\nRender time: ${renderTime}ms\nInternet speed: ${speedRef.current || "N/A"} Mbps`,
          [{ text: "OK" }]
        );

        startTimeRef.current = null;
        speedRef.current = null;
      });
    }
  }, [posts.length, fetchTimeMs, postsCount]);

  const getAllPosts = async (isRefresh = false) => {
    const startTime = Date.now();
    startTimeRef.current = startTime;

    try {
      if (isRefresh) setRefreshing(true);

      const response = await onFetchAllPosts();

      if (response.status !== 200) {
        throw new Error(response.data?.message || "Failed to fetch posts");
      }

      const postsData = response.data;

      // Calculate approximate internet speed
      let dataSizeBytes = 0;
      const contentLength = response.headers?.["content-length"];
      if (contentLength) {
        dataSizeBytes = parseInt(contentLength, 10);
      } else {
        dataSizeBytes = new TextEncoder().encode(JSON.stringify(postsData)).length;
      }

      const fetchTime = Date.now() - startTime;
      const fetchTimeSec = fetchTime / 1000;
      const bitsPerSecond = fetchTimeSec > 0 ? (dataSizeBytes * 8) / fetchTimeSec : 0;
      const speed = (bitsPerSecond / (1024 * 1024)).toFixed(2);

      speedRef.current = speed;
      setSpeedMbps(speed);
      setFetchTimeMs(fetchTime);
      setPostsCount(postsData.length);

      const postsWithInteraction = postsData.map((post) => ({
        ...post,
        agreeCount: post.agreeCount || 0,
        disagreeCount: post.disagreeCount || 0,
      }));

      setPosts(postsWithInteraction);
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", error.message || "Could not load posts. Please try again.");
    } finally {
      if (isRefresh) setRefreshing(false);
    }
  };

  const onRefresh = () => {
    getAllPosts(true);
  };

  const handleVote = async (postId, action) => {
    try {
      const response = await onVote(postId, action);
      if (response.status !== 200) {
        throw new Error(response.data?.message || "Vote failed");
      }
      const data = response.data;

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
        )
      );
    } catch (error) {
      console.error("Vote error:", error);
      Alert.alert(error.message || "Vote failed. Please try again.");
    }
  };

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
          contentContainerStyle={{ flexGrow: 1 }}   // <-- Added contentContainerStyle
          // This forces the list container to fill the screen 
          // so pull-to-refresh works even when there are 0 items.

          ListHeaderComponent={
            posts.length > 0 && (
              <View style={{ padding: 10 }}>
                <Text>Posts fetched: {postsCount}</Text>
                <Text>Fetch time: {fetchTimeMs}ms</Text>
                <Text>Render time: {renderTimeMs}ms</Text>
                <Text>Approx. link speed: {speedMbps} Mbps</Text>
              </View>
            )
          }
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// Keep PostCard and styles unchanged


const PostCard = ({ item, onVote}) => {
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


  const postApproved = item.approvalStatus === "approved";
  const postRejected = item.approvalStatus === "rejected";


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
                  <Text style={styles.commentUser}>{item.username || 'Anonymous'}:</Text>
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
          <Text style={{ fontWeight: "bold" }}>{item.username}</Text>
          <Text style={{ color: "gray" }}>from {item.location}</Text>
        </View>
        <View>
          <Text style={ postApproved ? styles.postApproved :postRejected ? styles.postRejected : styles.pressableButton}>{item.approvalStatus}</Text>
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
              userHasAgreed && styles.agreeButtonPressed,
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
              userHasDisagreed && styles.disagreeButtonPressed,
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

          {/* The share button */}
          <Pressable
            style={styles.pressableButton}
            onPress={handleShare}>
            <Ionicons name="share-social" size={18} color="black" />
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
    textTransform: "capitalize"
  },
  agreeButtonPressed: {
    backgroundColor: "#4CAF50",
  },
  disagreeButtonPressed: {
    backgroundColor: "#ff4444cc",
  },
  postApproved: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "#4CAF50",
    elevation: 3,
    textTransform: "capitalize"
  },
  postRejected: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "#ff4444cc",
    elevation: 3,
    textTransform: "capitalize"
  },
});