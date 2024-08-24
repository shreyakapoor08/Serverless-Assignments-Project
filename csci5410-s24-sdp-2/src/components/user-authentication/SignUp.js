// SignUp component
import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { TextField, Button, Container, Grid, Typography, Box, MenuItem, Select, FormControl, InputLabel, Snackbar, FormControlLabel, Checkbox } from "@mui/material";
import MuiAlert from '@mui/material/Alert';

const securityQuestions = [
  "What was your childhood nickname?",
  "What is the name of your favorite childhood friend?",
  "In what city or town did your mother and father meet?",
  "What is the name of your first pet?",
  "What was your first car?",
  "What elementary school did you attend?",
  "What is the name of the town where you were born?",
];

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    securityQuestions: ["", "", ""],
    securityAnswers: ["", "", ""],
  });
  const [isPropertyAgent, setIsPropertyAgent] = useState(false);

  const [errors, setErrors] = useState(formData);
  const { signUp, error, loading, successMessage } = useContext(AuthContext);
  const navigate = useNavigate();
  const [severity, setSeverity] = useState("success");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  useEffect(() => {
    if (error) {
      setMessage(error);
      setSeverity("error");
      setOpen(true);
    }
  }, [error]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSecurityQuestionChange = (index) => (event) => {
    const newSecurityQuestions = [...formData.securityQuestions];
    newSecurityQuestions[index] = event.target.value;
    setFormData({
      ...formData,
      securityQuestions: newSecurityQuestions,
    });

    const newErrors = { ...errors };
    newErrors.securityQuestions[index] = "";
    setErrors(newErrors);
  };

  const handleSecurityAnswerChange = (index) => (event) => {
    const newSecurityAnswers = [...formData.securityAnswers];
    newSecurityAnswers[index] = event.target.value;
    setFormData({
      ...formData,
      securityAnswers: newSecurityAnswers,
    });

    const newErrors = { ...errors };
    newErrors.securityAnswers[index] = "";
    setErrors(newErrors);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = {};

    if (!/^[a-zA-Z]+$/.test(formData.firstName)) {
      newErrors.firstName = "First name should contain only letters";
    }

    if (!/^[a-zA-Z]+$/.test(formData.lastName)) {
      newErrors.lastName = "Last name should contain only letters";
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(formData.password)) {
      newErrors.password = "Password should be alpha-numeric, at least 8 characters long and have at least 1 special character";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    formData.securityAnswers.forEach((answer, index) => {
      if (!answer) {
        newErrors[`securityAnswer${index}`] = "Security answer is required";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      await signUp({ ...formData, user_role: isPropertyAgent ? 'property_agent' : 'user' }); 
    }
  };

  useEffect(()=>{
    if(successMessage){
      setMessage(successMessage);
      setSeverity("success");
      setOpen(true);
      setTimeout(() => {
        setFormData({
          firstName: "",
          lastName: "",
          phoneNumber: "",
          email: "",
          password: "",
          confirmPassword: "",
          securityQuestions: ["", "", ""],
          securityAnswers: ["", "", ""],
        });
        navigate("/login");
      }, 3000);
    }
  }, [successMessage,navigate])
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
      <Container maxWidth="md" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Registration
        </Typography>
        <Link to={"/login"}>Already Registered User? Login</Link>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                margin="normal"
              />
              <TextField
                fullWidth
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                margin="normal"
              />
              <TextField
                fullWidth
                name="phoneNumber"
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                fullWidth
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                margin="normal"
              />
              <TextField
                fullWidth
                name="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                margin="normal"
              />
              <TextField
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
            <FormControlLabel control={<Checkbox onChange={() => setIsPropertyAgent(!isPropertyAgent)} />} label="Property Agent" />
              <Typography variant="h6">Security Questions</Typography>
              {formData.securityQuestions.map((question, index) => (
                <div key={index}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id={`security-question-label-${index}`}>Security Question</InputLabel>
                    <Select
                      labelId={`security-question-label-${index}`}
                      value={question}
                      onChange={handleSecurityQuestionChange(index)}
                    >
                      {securityQuestions.map((q, idx) => (
                        <MenuItem key={idx} value={q}>{q}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    name={`securityAnswer${index}`}
                    label="Answer"
                    value={formData.securityAnswers[index]}
                    onChange={handleSecurityAnswerChange(index)}
                    error={!!errors[`securityAnswer${index}`]}
                    helperText={errors[`securityAnswer${index}`]}
                    margin="normal"
                  />
                </div>
              ))}
            </Grid>
          </Grid>
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 3 }}>
            {loading ? 'Loading...' : 'Register'}
          </Button>
        </form>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MuiAlert elevation={6} variant="filled" onClose={handleClose} severity={severity}>
          {message}
        </MuiAlert>
      </Snackbar>
      </Container>
    </Box>
  );
}

export default SignUp;
