import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { db } from "../../config";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Feedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const feedbackCollection = collection(db, "feedbacks");
        const feedbackSnapshot = await getDocs(feedbackCollection);
        const feedbackList = feedbackSnapshot.docs.map((doc) => doc.data());
        setFeedbacks(feedbackList);
        setTimeout(() => setLoading(false), 3000);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };
    fetchFeedbacks();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" component="h1" mt={2}>
          Feedbacks are loading. Please wait...
        </Typography>
      </Box>
    );
  }

  const calSentiment = (sentiment) => {
    if (sentiment > 0.6) {
      return "Excellent";
    } else if (sentiment > -0.3) {
      return "Average";
    }
    return "Bad";
  };

  

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Feedbacks
        </Typography>
       
      </Box>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#FAFAFA", fontSize: 14 }}>
            <TableCell>Room Name/Id</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Feedback</TableCell>
            <TableCell>Sentiment</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {feedbacks.map((feedback) => (
            <TableRow key={`${feedback.roomId}-${feedback.userId}`}>
              <TableCell>{feedback.roomName? feedback.roomName : feedback.roomId}</TableCell>
              <TableCell>{feedback?.userEmail || "N/A"}</TableCell>
              <TableCell>{feedback.message}</TableCell>
              <TableCell>
                {feedback.sentiment ? calSentiment(feedback.sentiment) : "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default Feedbacks;
