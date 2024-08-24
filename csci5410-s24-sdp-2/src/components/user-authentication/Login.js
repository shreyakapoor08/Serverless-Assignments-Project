import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");
  const navigate = useNavigate();
  const { error, loading, loginUserCred, successMessage } = useContext(AuthContext);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    if (error) {
      setMessage(error);
      setSeverity("error");
      setOpen(true);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      setMessage(successMessage);
      setSeverity("success");
      setOpen(true);
      setTimeout(() => {
        setFormData({ email: "", password: "" });
        navigate("/security-questions");
      }, 3000);
    }
  }, [successMessage]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await loginUserCred({ ...formData });
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundImage: 'url("https://source.unsplash.com/random")',
        backgroundSize: 'cover',
      }}
    >
      <Container maxWidth="sm" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            name="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            name="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
            {loading ? 'Loading...' : 'Login'}
          </Button>
        </form>
        <Link to={"/signup"}>
          <Typography align="center" sx={{ mt: 2 }}>
            New User? Signup
          </Typography>
        </Link>
      </Container>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MuiAlert elevation={6} variant="filled" onClose={handleClose} severity={severity}>
          {message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default Login;
