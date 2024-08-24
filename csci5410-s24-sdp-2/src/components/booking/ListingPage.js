import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Typography, TextField, Button, Grid, Paper, List, ListItem,
  ListItemText, ListItemAvatar, Avatar, IconButton, Dialog, DialogActions, DialogContent, DialogTitle,
  Box, Divider, InputLabel
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/system';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { CardActionArea } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {ROOMS_API_URL, BOOKING_API_URL} from '../../API_URL';

const StyledDescription = styled('div')({
    opacity: 0,
    transition: 'opacity 0.3s',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    color: 'white',
    alignContent: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '10px',
    '&:hover': {
      opacity: 1,
    },
  });

const StyledCardMedia = styled(CardMedia)({
    position: 'relative',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
});

const StyledTitle = styled(Typography)({
    position: 'absolute',
    top: 0,
    left: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    padding: '5px 10px',
    margin: '10px',
    borderRadius: '5px',
});

const DiscountBadge = styled('div')({
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(255, 0, 0, 0.8)',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '5px',
    fontWeight: 'bold',
});

const PriceWrapper = styled('div')({
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    color: 'white',
});


const ListingPage = ({ handleRoomSelect }) => {
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const navigate = useNavigate();
    const dateOptions = { year: 'numeric', month: 'long', day: '2-digit' };
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteBookingId, setDeleteBookingId] = useState(null);

    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('userRole') || '';
    let user;
    if(storedUser){
      user = JSON.parse(storedUser);
    }

    useEffect(() => {
        fetchRooms();
        if(user){
          getBookings();
        }
    }, []);

    const selectRoom = (room) => {
      handleRoomSelect(room);
      navigate(`/listing/${room.id}`);
    };

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

    const getBookings = () => {
      //Get all bookings from getAllBookings lambda function
      const userId = user.userId;
      axios.post(`${BOOKING_API_URL}/getBookings`, {
        userId: userId
      })
      .then((response) => {
        console.log(response);
        setBookings(response.data.bookings);
      }, (error) => {
        console.log(error);
      });
    }

    const handleDeleteClick = (bookingId) => {
      setDeleteBookingId(bookingId);
      setOpenDialog(true);
    };

    const handleConfirmDelete = async () => {
      //Delete a booking using deleteBooking lambda function 
      try {
        const userId = user.userId;
        axios.post(`${BOOKING_API_URL}/deleteBooking`, {
          userId: userId,
          bookingId: deleteBookingId
        })
        .then((response) => {
          console.log(response);
          setBookings(prevBookings => prevBookings.filter(booking => booking.bookingId !== deleteBookingId));
        }, (error) => {
          console.log(error);
        });
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
      setOpenDialog(false);
    };
  
    const handleCancelDelete = () => {
      setOpenDialog(false);
    };



    return (
    <>
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', pt: '1em' }}>
        Book a Room
        <Divider sx={{ marginTop: 2 }} />
      </Typography>
      <Grid container spacing={2} pt={2}>
        {rooms.map(room => (
          <Grid item xs={12} sm={6} md={3} key={room.id}>
            <RoomCard room={room} onSelect={() => selectRoom(room)}/>
          </Grid>
        ))}
      </Grid>
      { storedRole==='user' && bookings?.length > 0 ?
      (<><Typography variant="h4" gutterBottom sx={{ textAlign: 'center', pt: '1em' }}>
        Your Bookings
        <Divider sx={{ marginTop: 2 }} />
      </Typography>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>     
      <List sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 160px)', maxWidth: '600px', width: '100%' }}>
        {bookings?.map((booking) => (
          <ListItem key={booking.bookingId} secondaryAction={
            <>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(booking.bookingId)}>
                <DeleteIcon />
              </IconButton>
            </>
          }>
            <ListItemAvatar>
              <Avatar variant="circle" src={<ImageIcon />} sx={{ width: 100, height: 100, mr: '1em' }} />
            </ListItemAvatar>
            <ListItemText
              primary={booking.roomName}
              secondary={`Checkin date: ${new Intl.DateTimeFormat('en-US', dateOptions).format(new Date(booking.startDate))} | Checkout date: ${new Intl.DateTimeFormat('en-US', dateOptions).format(new Date(booking.endDate))}`}
              primaryTypographyProps={{ fontWeight: 'bold' }}
              secondaryTypographyProps={{ color: 'text.secondary' }}
            />
          </ListItem>
        ))}
      </List>
      </div></>) : (<></>)}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this booking?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
    </>
    );
}

const RoomCard = ({room, onSelect}) => {
  return (
    <Card sx={{ maxWidth: 345, height: 300, position: 'relative' }} >
        <CardActionArea onClick={() => onSelect(room)} sx={{ height: '100%', position: 'relative' }}>
          <StyledCardMedia
            component="img"
            height="140"
            image={room.image}
            alt={room.description}
          />
          <StyledTitle variant="h5" component="div">
            {room.name}
          </StyledTitle>
          {room.discount > 0 && (
            <DiscountBadge>
              {`-${room.discount}%`}
            </DiscountBadge>
          )}
          <StyledDescription>
            <Typography variant="body2" sx={{ color: 'white', fontSize: '1.2rem' }}>
              {room.description}
            </Typography>
            <PriceWrapper>
              {room.discount > 0 ? (
                  <>
                  <Typography variant="body2" sx={{ textDecoration: 'line-through', fontSize: '1.2rem', textAlign: 'left' }}>
                      ${room.price}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'left' }}>
                      ${room.price * (1 - room.discount / 100)}
                  </Typography>
                  </>
              ) : (
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'left' }}>
                  ${room.price}
                  </Typography>
              )}
              </PriceWrapper>
          </StyledDescription>
          
        </CardActionArea>
      </Card>
  );
}

export default ListingPage;