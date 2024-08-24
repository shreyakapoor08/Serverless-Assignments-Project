import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

import { Container, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, Grid, Paper, TableContainer
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { SnackbarProvider, useSnackbar } from 'notistack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {ROOMS_API_URL, BOOKING_API_URL} from '../../API_URL';

const RoomBooking = () => {

  const storedUser = localStorage.getItem('user');
  const user = JSON.parse(storedUser);
  const navigate = useNavigate();

  const [selectedRoom, setSelectedRoom] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [bookings, setBookings] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const dateOptions = { year: 'numeric', month: 'long', day: '2-digit' };

  const rooms = ['101', '102', '103'];

  useEffect(() => {
    getBookings();
  }, []);

  //Show alert messages
  const showMessage = (msg, variant) => {
    enqueueSnackbar(msg, { variant });
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

  const handleBooking = () => {
    if (selectedRoom && startDate && endDate) {
      if(endDate < startDate){
        showMessage("End date can't be before start date", 'error');
      }
      else{
        // setBookings([
        //   ...bookings,
        //   { room: selectedRoom, startDate: startDate, startDate: endDate }
        // ]);
        setSelectedRoom('');
        setStartDate(null);
        setEndDate(null);
        
        //Add request in SQS using lambda function

        const userId = user.userId;
        const message = {
          userId: userId,
          roomId: selectedRoom,
          startDate: startDate,
          endDate: endDate
        }

        try {
          axios.post(`${BOOKING_API_URL}/sendBooking`, message);
          showMessage('Room booking queued! You will be notified soon.', 'success')
        } catch (error) {
          console.error('Error while booking room:', error);
          showMessage('Error while booking the room.', 'error')
        }
      }
      
    } else {
      showMessage("Please fill in all fields", 'error');
    }
  };

  const deleteBooking = (bookingId) => {
    //Delete a booking using deleteBooking lambda function
    const userId = user.userId;
    axios.post(`${BOOKING_API_URL}/deleteBooking`, {
      userId: userId,
      bookingId: bookingId
    })
    .then((response) => {
      console.log(response);
      setBookings(prevBookings => prevBookings.filter(booking => booking.bookingId !== bookingId));
    }, (error) => {
      console.log(error);
    });
  }

  return (
    <>
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Book a Room
      </Typography>
      <Paper style={{ padding: 20 }}>
        <FormControl fullWidth>
          <InputLabel id="selectRoomInputLabel">Select Room</InputLabel>
          <Select
            labelId="selectRoomInputLabel"
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            label="Select Room"
          >
            {rooms.map((room) => (
              <MenuItem key={room} value={room}>
                {room}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Grid container spacing={2} pt={2}>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start date"
                value={startDate}
                onChange={(date)=>{setStartDate(date)}}
                
                />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End date"
                  value={endDate}
                  onChange={(date)=>{setEndDate(date)}}
                  
                  />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleBooking} fullWidth>
              Book Room
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
    <Container maxWidth="sm" sx={{ pt: 2 }}>
      <Typography variant="h4" gutterBottom>
        Your bookings
      </Typography>
      <Paper >
      <Table sx={{ minWidth: 500 }}  size="small" aria-label="Bookings table">
        <TableHead>
          <TableRow sx={{backgroundColor:'#FAFAFA', fontSize: 14}}>
            <TableCell>Room</TableCell>
            <TableCell align="right">Start Date</TableCell>
            <TableCell align="right">End Date</TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings?.map((booking) => (
            <TableRow
              key={booking.bookingId}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {booking.roomId}
              </TableCell>
              <TableCell align="right">
                {new Intl.DateTimeFormat('en-US', dateOptions).format(new Date(booking.startDate))}
              </TableCell>
              <TableCell align="right">
                {new Intl.DateTimeFormat('en-US', dateOptions).format(new Date(booking.endDate))}
              </TableCell>
              <TableCell align="right">
                <IconButton color="error" onClick={() => {deleteBooking(booking.bookingId)}}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </Paper>
      {user?.user_role === "user" && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate(`/feedback/add`)}
                      sx={{ mt: 2, ml: 2 }}
                    >
                      Give Feedback
                    </Button>
                  )}
    </Container>
    </>
  );
};

export default function RoomBookingNotistack() {
  return (
    <SnackbarProvider maxSnack={3}>
      <RoomBooking />
    </SnackbarProvider>
  );
}