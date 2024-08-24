import React, {  useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  TextField,
  Button,
  Typography,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import axios from "axios";


const ChatBot = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [userId, setUserId] = useState("Guest");
  const chatContentRef = useRef(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const user = JSON.parse(storedUser);
    if (user?.userId) {
      setUserId(user.userId);
    }
  }, []);
  const sendMessage = async () => {
    if (message.trim() !== "") {
      const updatedChat = [...chat, { user: true, text: message }];
      setChat(updatedChat);
      try {
        const response = await axios.post(`https://qvtmdb2uy4.execute-api.us-east-1.amazonaws.com/Development/send`, {
          text: message,
          user: userId
        });
        setChat([...updatedChat, { user: false, text: response.data.body }]);
      } catch (error) {
        console.error("Error:", error);
        setChat([
          ...updatedChat,
          {
            user: false,
            text: "Sorry, I encountered an error. Please try again later.",
          },
        ]);
      }

      setMessage("");
    } else {
      toast.error("Please type your request before hitting send.");
    }
  };

  useEffect(() => {
    chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
  }, [chat]);

  const chatMessages = chat.map((item, index) => {
    if (item && typeof item === "object" && "user" in item) {
      return (
        <div key={index}>
          {item.user ? (
            <div style={{ textAlign: "right", marginBottom: "8px" }}>
              <Typography
                variant="body1"
                style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: "8px",
                  backgroundColor: "#3f51b5",
                  color: "#ffffff",
                }}
              >
                {item.text}
              </Typography>
            </div>
          ) : (
            <div style={{ textAlign: "left", marginBottom: "8px" }}>
              <Typography
                variant="body1"
                style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: "8px",
                  backgroundColor: "#f1f1f1",
                  color: "#333333",
                }}
              >
                {item.text}
              </Typography>
            </div>
          )}
        </div>
      );
    }
    return null;
  });

  return (
    <Container>
      <Typography
        variant="h4"
        style={{ textAlign: "center", paddingTop: "2%" }}
      >
        DalVacationHome Chatbot 
      </Typography>
      <Card
        variant="outlined"
        style={{
          marginTop: "16px",
          padding: "16px",
          height: "400px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <CardContent
          style={{ flexGrow: 0, overflowY: "auto" }}
          ref={chatContentRef}
        >
          {chatMessages}
        </CardContent>
        <div
          style={{ display: "flex", alignItems: "center", marginTop: "8px" }}
        >
          <TextField
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            required
            margin="normal"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            style={{ marginLeft: "8px" }}
          >
            Send
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default ChatBot;
