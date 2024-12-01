import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Animated,
  PanResponder,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Mock chat function (replace with actual AI integration later)
const mockChat = async (message: string) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve(`This is a mock response to: "${message}"`);
    }, 1000);
  });
};

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ id: number; content: string; role: "user" | "assistant" }>
  >([]);
  const [conversations, setConversations] = useState([
    { id: 1, title: "New chat" },
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarAnimation = useRef(new Animated.Value(-250)).current;

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = {
        id: messages.length,
        content: input,
        role: "user" as const,
      };
      setMessages([...messages, userMessage]);
      setInput("");

      const response = await mockChat(input);
      const assistantMessage = {
        id: messages.length + 1,
        content: response,
        role: "assistant" as const,
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    }
  };

  const startNewConversation = () => {
    setConversations([
      ...conversations,
      { id: conversations.length + 1, title: "New chat" },
    ]);
    setMessages([]);
  };

  const toggleSidebar = (open: boolean) => {
    console.log("toggleSidebar - open: ", open);
    const toValue = open ? 0 : -250;
    Animated.timing(sidebarAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsSidebarOpen(open);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        if (isSidebarOpen && gestureState.x0 > 250) {
          toggleSidebar(false);
          return true;
        }
        return false;
      },
      onPanResponderRelease: () => {
        // This is called when the touch is released
      },
    })
  ).current;

  let [testData, setTestData] = useState([]);
  const getTestData = () => {
    fetch("http://localhost:3002/posts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json(); // Parse response directly as JSON
      })
      .then((data) => {
        console.log("res: ", data); // Log the received response data
      })
      .catch((error) => console.error("error: ", error));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#c7c7c7", "#e6e6e6", "#c7c7c7"]}
        style={styles.content}
        {...panResponder.panHandlers}
      >
        {/* Sidebar */}
        <Animated.View
          style={[
            styles.sidebar,
            { transform: [{ translateX: sidebarAnimation }] },
          ]}
        >
          <TouchableOpacity onBlur={() => toggleSidebar(false)}>
            <TouchableOpacity
              style={styles.newChatButton}
              onPress={startNewConversation}
            >
              <LinearGradient
                colors={["#e6e6e6", "#d9d9d9", "#999999"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <Ionicons name="add" size={24} color="#333" />
                <Text style={styles.newChatButtonText}>New chat</Text>
              </LinearGradient>
            </TouchableOpacity>
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.conversationItem}>
                  <Text style={styles.conversationTitle}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Main chat area */}
        <View style={styles.chatArea}>
          {/* Hamburger button */}
          <TouchableOpacity
            style={styles.hamburgerButton}
            onPress={() => toggleSidebar(true)}
          >
            <LinearGradient
              colors={["#e6e6e6", "#d9d9d9", "#999999"]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <Ionicons name="menu" size={24} color="#333" />
            </LinearGradient>
          </TouchableOpacity>

          <FlatList
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageContainer,
                  item.role === "user"
                    ? styles.userMessage
                    : styles.assistantMessage,
                ]}
              >
                <LinearGradient
                  colors={
                    item.role === "user"
                      ? ["#007AFF", "#0056B3"]
                      : ["#E5E5EA", "#D1D1D6"]
                  }
                  style={styles.messageGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text
                    style={[
                      styles.messageText,
                      item.role === "user"
                        ? styles.userMessageText
                        : styles.assistantMessageText,
                    ]}
                  >
                    {item.content}
                  </Text>
                </LinearGradient>
              </View>
            )}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type your message here..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              onPressIn={() => toggleSidebar(false)}
              onPressOut={getTestData}
            >
              <LinearGradient
                colors={["#007AFF", "#0056B3"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <Ionicons name="send" size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6e6e6",
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "#202123",
    padding: 10,
    zIndex: 10,
  },
  newChatButton: {
    marginBottom: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  newChatButtonText: {
    color: "#333",
    marginLeft: 10,
    fontWeight: "bold",
  },
  conversationItem: {
    padding: 10,
    borderRadius: 5,
  },
  conversationTitle: {
    color: "white",
  },
  chatArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  hamburgerButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 5,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  messageContainer: {
    padding: 5,
    marginVertical: 5,
    marginHorizontal: 10,
    maxWidth: "80%",
  },
  messageGradient: {
    borderRadius: 10,
    padding: 10,
  },
  userMessage: {
    alignSelf: "flex-end",
  },
  assistantMessage: {
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: "white",
  },
  assistantMessageText: {
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#d0d0d0",
  },
  sendButton: {
    borderRadius: 20,
    width: 44,
    height: 44,
    overflow: "hidden",
  },
});
