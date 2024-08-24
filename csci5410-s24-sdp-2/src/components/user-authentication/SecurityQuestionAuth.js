import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { FETCH_SECURITY_QUESTIONS, VERIFY_SECURITY_QUESTIONS } from '../../API_URL';

const SecurityQuestionAuth = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchQuestions = async () => {
    try {
      const response = await axios.post(FETCH_SECURITY_QUESTIONS, { userId: user.userId });
      setQuestions(response.data);
    } catch (error) {
        setMessage('Failed to fetch security questions');
        setSeverity('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line
  }, []);

  const handleInputChange = (index, value) => {
    setAnswers({
      ...answers,
      [index]: value
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(VERIFY_SECURITY_QUESTIONS, {
        userId: user.userId,
        answers: Object.values(answers)
      });

      if (response.status === 200) {
        setMessage('Security questions answered correctly!');
        setSeverity('success');
        setOpen(true);
        setTimeout(() => {
          navigate('/human-challenge');
        }, 3000);
      }
    } catch (error) {
        setMessage('Incorrect answers for the security questions');
        setSeverity('error');
        setOpen(true);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography component="h1" variant="h5">
          Answer Security Questions
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {questions.map((question, index) => (
            <TextField
              key={index}
              margin="normal"
              required
              fullWidth
              label={question.question}
              value={answers[index] || ''}
              onChange={(e) => handleInputChange(index, e.target.value)}
            />
          ))}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Submit
          </Button>
        </Box>
      </Box>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MuiAlert elevation={6} variant="filled" onClose={handleClose} severity={severity}>
          {message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default SecurityQuestionAuth;
