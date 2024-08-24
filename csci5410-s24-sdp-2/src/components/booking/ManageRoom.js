import * as React from 'react';
import {
  Container, Typography, TextField, Button, Grid, Paper, List, ListItem,
  ListItemText, ListItemAvatar, Avatar, IconButton, Dialog, DialogActions, DialogContent, DialogTitle,
  Box, Divider, InputLabel
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {ROOMS_API_URL} from '../../API_URL';

const ManageRoom = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [formValues, setFormValues] = useState({ name: '', description: '', image: '', price: '', discount: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteRoomId, setDeleteRoomId] = useState(null);
    const [errors, setErrors] = React.useState({});

    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('userRole') || '';
    let user;
    if(storedUser){
      user = JSON.parse(storedUser);
    }

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

  
  if(!user || storedRole !== 'property_agent'){
    return (<Typography variant="h4" 
      color="textSecondary" 
      sx={{mt:'1em', mb:'0.5em', justifyContent:'center', textAlign: 'center'}}>
        You are not authorized to view this page!
      </Typography>);
  }

  const handleEditClick = (room) => {
    setSelectedRoom(room);
    setFormValues({ ...room });
    setIsEditing(true);
  };

  const handleDeleteClick = (roomId) => {
    setDeleteRoomId(roomId);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${ROOMS_API_URL}?roomId=${deleteRoomId}`);
      setRooms(rooms.filter(room => room.id !== deleteRoomId));
    } catch (error) {
      console.error('Error deleting room:', error);
    }
    setOpenDialog(false);
  };

  const handleCancelDelete = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const uploadImage = async (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        const base64Image = reader.result.split(',')[1];
        const fileType = file.type.split('/')[1];
        const roomId = selectedRoom ? selectedRoom.id : `new-${Date.now()}`;
        const data = {
          image: base64Image,
          bucketName: "sdp2-room-images",
          key: `room/${roomId}.${fileType}`
        };
        axios.post(`${ROOMS_API_URL}/image`, data)
          .then(response => {
            resolve(response.data.url);
          })
          .catch(error => {
            reject(error);
          });
      };
      reader.onerror = error => reject(error);
    });
  };


  const handleSave = async () => {
    const newErrors = {};
  
    // Validation checks
    if (!formValues.name) newErrors.name = "Name is required";
    if (!formValues.description) newErrors.description = "Description is required";
    if (!formValues.price) newErrors.price = "Price is required";
    if (!formValues.discount) newErrors.discount = "Discount is required";
    if (!formValues.imageFile && !isEditing) newErrors.image = "Image is required";
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    try {
      let formDetails = {...formValues};
      if (formValues.imageFile) {
        const imageUrl = await uploadImage(formValues.imageFile);
        formDetails = {...formDetails, image: imageUrl};
        delete formDetails.imageFile;
      }
      
      
      if(isEditing){
        formDetails = {...formDetails, roomId: selectedRoom.id};
        await axios.put(ROOMS_API_URL, formDetails);
      }
      else{
        await axios.post(ROOMS_API_URL, formDetails);
      }
      fetchRooms();
      setFormValues({
        name: '',
        description: '',
        image: '',
        imageFile: null,
        price: '',
        discount: ''
      });
      setErrors({});
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving room:", error);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFormValues(prevValues => ({
      ...prevValues,
      imageFile: file
    }));
  };

  return (
    <Container maxWidth="lg" sx={{mt:'1.5em'}}>
      <Grid container spacing={4} sx={{ height: '85vh' }}>
        <Grid item xs={12} md={6} sx={{ height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ position: 'sticky', top: 0, backgroundColor: 'background.paper', zIndex: 1, textAlign: 'center' }}>
              Manage Rooms
              <Divider sx={{ marginTop: 2 }} />
            </Typography>
            
            <List sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 160px)' }}>
              {rooms?.map((room) => (
                <ListItem key={room.id} secondaryAction={
                  <>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(room)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(room.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                }>
                  <ListItemAvatar>
                    <Avatar variant="circle" src={room.image || <ImageIcon />} sx={{ width: 100, height: 100, mr: '1em' }} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={room.name}
                    secondary={`Price: $${room.price} | Discount: ${room.discount}%`}
                    primaryTypographyProps={{ fontWeight: 'bold' }}
                    secondaryTypographyProps={{ color: 'text.secondary' }}
                  />
                </ListItem>
              ))}
            </List>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'initial', justifyContent: 'center' }}>
          <Paper elevation={3} sx={{ padding: 2, width: '100%', maxWidth: 500, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom sx={{textAlign: 'center'}}>
              {isEditing ? 'Edit Room' : 'Add New Room'}
            </Typography>
            <Box component="form" noValidate autoComplete="off">
              <TextField
                label="Name"
                name="name"
                value={formValues.name}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
                required
                error={!!errors.name}
                helperText={errors.name}
              />
              <TextField
                label="Description"
                name="description"
                value={formValues.description}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
                required
                error={!!errors.description}
                helperText={errors.description}
              />
              <TextField
                label="Price"
                name="price"
                type="number"
                value={formValues.price}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
                required
                error={!!errors.price}
                helperText={errors.price}
              />
              <TextField
                label="Discount"
                name="discount"
                type="number"
                value={formValues.discount}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
                required
                error={!!errors.discount}
                helperText={errors.discount}
              />
              <TextField
                label="Upload Image"
                name="image"
                type="file"
                onChange={handleFileChange}
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                inputProps={{ accept: 'image/*' }}
                error={!!errors.image}
                helperText={errors.image}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                fullWidth
                sx={{ marginTop: 2 }}
              >
                {isEditing ? 'Save Changes' : 'Add Room'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this room?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ManageRoom;
