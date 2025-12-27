import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { server } from "@/components/serverConfig";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

// Mock current user (in real app, get this from auth context)
export const CURRENT_USER_ID = "user123"; // Replace with actual logged-in user later

export default function App() {
  // setting all the required states
  const [posts, setPosts] = useState([]); // dynamic array to hold posts fetched from server
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getAllPosts();
  }, []); // The second parameter is a dependency array, which ensures the effect runs only
          // once when the component mounts. Component mounting on a React Native app is similar
          // to page load on a web app.
          // I write these comments for my own understanding, btw (to the moderator)

  const getAllPosts = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); // Only set refreshing for pull-to-refresh
      const response = await fetch(`${server}/allposts`);

      if (!response.ok) throw new Error("Failed to fetch posts");

      const postsData = await response.json();

      // Initialize interaction state for each post 
      const postsWithInteraction = postsData.map(post => ({
        ...post,
        userHasAgreed: false,
        userHasDisagreed: false,
        agreeCount: post.agreeCount || 0,
        disagreeCount: post.disagreeCount || 0,
      }));

      setPosts(postsWithInteraction);
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("Error", "Could not load posts. Please try again.");
    } finally {
      if (isRefresh) setRefreshing(false);
    }
  };

  const onRefresh = () => {
    getAllPosts(true);
  };

  // Handle Agree/Disagree action
  const handleVote = async (postId, action) => {
    const post = posts.find(p => p.postID === postId);
    if (!post) return;

    // Prevent double voting
    if (action === "agree" && post.userHasAgreed) {
      Alert.alert("Already voted", "You have already agreed with this post.");
      return;
    }
    if (action === "disagree" && post.userHasDisagreed) {
      Alert.alert("Already voted", "You have already disagreed with this post.");
      return;
    }

    try {
      const response = await fetch(`${server}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postID: post.postID,
          postTitle: post.title,
          userID: CURRENT_USER_ID,
          action: action, // "agree" or "disagree"
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Vote failed");

      // Update local state optimistically
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.postID === postId
            ? {
                ...p,
                agreeCount: action === "agree" ? p.agreeCount + 1 : p.agreeCount,
                disagreeCount: action === "disagree" ? p.disagreeCount + 1 : p.disagreeCount,
                userHasAgreed: action === "agree" ? true : p.userHasAgreed,
                userHasDisagreed: action === "disagree" ? true : p.userHasDisagreed,
              }
            : p
        )
      );
    } catch (error) {
      console.error("Vote error:", error);
      Alert.alert("Failed", "Could not record your vote. Try again.");
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <PostCard item={item} onVote={handleVote} currentUserId={CURRENT_USER_ID} />
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

export const PostCard = ({ item, onVote, currentUserId }) => {
  const mediaURL = item.mediaURL
    ? `${server}/uploads/${encodeURIComponent(item.mediaURL)}`
    : null;

  let agreeButtonText = "Agree";
  let disagreeButtonText = "Disagree";
  let agreeCounterText = "Agreed: ";
  let disagreeCounterText = "Disagreed: ";

  if (item.postType === "Petition") {
    agreeButtonText = "Sign";
    disagreeButtonText = "Disagree";
    agreeCounterText = "Signed";
    disagreeCounterText = "Disagreed";
  } else if (item.postType === "News Post") {
    agreeCounterText = "Agreed";
    disagreeCounterText = "Disagreed";
  }

  const hasVoted = item.userHasAgreed || item.userHasDisagreed;
  const userVoteType = item.userHasAgreed ? "agree" : item.userHasDisagreed ? "disagree" : null;

  return (
    <View style={styles.PostCard}>
      <View style={styles.horizontalMultiplexContainer}>
        <Ionicons name="person-circle" size={40} color="#000" />
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
              item.userHasAgreed && styles.buttonPressed,
            ]}
            onPress={() => onVote(item.postID, "agree")}
            disabled={hasVoted}
          >
            <Ionicons name="thumbs-up" size={18} color={item.userHasAgreed ? "white" : "black"} />
            <Text style={{ marginLeft: 5, color: item.userHasAgreed ? "white" : "black" }}>
              {agreeButtonText}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.pressableButton,
              item.userHasDisagreed && styles.buttonPressed,
              { backgroundColor: "#ff4444cc" },
            ]}
            onPress={() => onVote(item.postID, "disagree")}
            disabled={hasVoted}
          >
            <Ionicons name="thumbs-down" size={18} color={item.userHasDisagreed ? "white" : "black"} />
            <Text style={{ marginLeft: 5, color: item.userHasDisagreed ? "white" : "black" }}>
              {disagreeButtonText}
            </Text>
          </Pressable>
        </View>

        {/* Vote Counts */}
        <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 8 }}>
          <Text style={{ fontWeight: item.userHasAgreed ? "bold" : "normal" }}>
            {agreeCounterText}: {item.agreeCount}
          </Text>
          <Text style={{ fontWeight: item.userHasDisagreed ? "bold" : "normal" }}>
            {disagreeCounterText}: {item.disagreeCount}
          </Text>
        </View>

        {/* Comment Section */}
        <View style={styles.horizontalMultiplexContainer}>
          <View style={styles.CommentsEntry}>
            <TextInput
              placeholder="Leave a comment..."
              placeholderTextColor="grey"
              style={{ flex: 1, padding: 8 }}
            />
            <Pressable>
              <Ionicons name="send" size={20} color="#007AFF" />
            </Pressable>
          </View>

          <Pressable style={{ flexDirection: "row", alignItems: "center" }}>
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