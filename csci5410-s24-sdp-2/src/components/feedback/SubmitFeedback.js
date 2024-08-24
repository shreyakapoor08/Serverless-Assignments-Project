import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography, Box,  Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { db } from "../../config";
import { addDoc, collection } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ROOMS_API_URL } from '../../API_URL.js'
import axios from 'axios';

const SubmitFeedback = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedRoomName, setSelectedRoomName] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  //const rooms = ['101', '102', '103'];
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchRooms();
  }, []);

 const fetchRooms = async () => {
  try {
    const response = await axios.get(ROOMS_API_URL);
    const processedRooms = response.data.map(room => ({
      id: room.roomId.S,
      name: room.name.S,
      description: room.description.S,
      image: room.image.S,
      price: room.price.N,
      discount: room.discount.N
    }));
    setRooms(processedRooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!message || !selectedRoom || !title){
        toast.error("Please fill all the details")
        return;
    }
    try {
      const feedbackCollection = collection(db, "feedbacks");
      await addDoc(feedbackCollection, {
        roomId: selectedRoom,
        roomName: selectedRoomName,
        title,
        message,
        userId: user.userId,
        userEmail: user.email,
        timestamp: new Date()
      });
      toast.success('Feedback submitted successfully!');
      setTimeout(() => navigate(`/feedbacks`), 2000)
    } catch (error) {
      console.error("Error submitting feedback: ", error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm" className="py-6">
      <Typography variant="h4" component="h1" gutterBottom>
        Feedback
      </Typography>
      <FormControl fullWidth>
          <InputLabel id="selectRoomInputLabel">Select Room</InputLabel>
          <Select
            labelId="selectRoomInputLabel"
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            label="Select Room"
          >
            {rooms.map((room) => (
              <MenuItem key={room.id} value={room.id} onClick={() => {setSelectedRoomName(room.name)}}>
                {room.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="title"
          label="Title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="message"
          label="Feedback Comment"
          type="text"
          id="message"
          multiline
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Submit Feedback
        </Button>
      </Box>
      <ToastContainer />
    </Container>
  );
};

export default SubmitFeedback;
