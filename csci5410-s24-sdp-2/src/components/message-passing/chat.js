import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './chat.css';

const Chat = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const customerId = searchParams.get('customer_id');
  const bookingReference = searchParams.get('booking_reference');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      console.log('UserId from localStorage:', parsedUser.userId);
      setUserId(parsedUser.userId);
    }
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`https://us-central1-csci5410-427115.cloudfunctions.net/agentresponsebybookingreference?bookingReference=${bookingReference}`);
        if (response.ok) {
          const data = await response.json();
          const formattedMessages = data.messages.map(msg => ({
            text: msg.message,
            sender: msg.sender_number === '2' ? 'user' : 'receiver'
          }));
          setMessages(formattedMessages);
        } else {
          console.error('Failed to fetch messages');
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (bookingReference) {
      fetchMessages();
      const intervalId = setInterval(fetchMessages, 3000);
      return () => clearInterval(intervalId);
    }
  }, [bookingReference]);

  const handleSendMessage = async () => {
    if (newMessage.trim() !== '') {
      const userMessage = { text: newMessage, timestamp: new Date(), sender: 'user' };
      setNewMessage('');
      await storeMessage(userMessage);
      fetchAgentResponseMessages();
      setInterval(() => {
        fetchAgentResponseMessages();
      }, 3000);
    }
  };

  const storeMessage = async (message) => {
    const messageData = {
      bookingReference,
      customer_id: customerId,
      agent_id: userId,
      message: message.text,
      sender_number: '2',
    };

    try {
      const response = await fetch('https://us-central1-csci5410-427115.cloudfunctions.net/storingMessages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        console.log('Message stored successfully');
      } else {
        console.log('Failed to store message');
      }
    } catch (error) {
      console.error('Error storing message:', error);
    }
  };

  const fetchAgentResponseMessages = async () => {
    console.log(bookingReference);
    try {
      const response = await fetch(`https://us-central1-csci5410-427115.cloudfunctions.net/agentresponsebybookingreference?bookingReference=${bookingReference}`);
      if (response.ok) {
        const responseData = await response.json();
        console.log('Agent response:', responseData);

        if (responseData.messages && responseData.messages.length > 0) {
          const agentMessages = responseData.messages.map((msg) => ({
            text: msg.message,
            sender: msg.sender_number === '2' ? 'user' : 'receiver',
          }));
          setMessages(agentMessages);
        }
      } else {
        console.log('Failed to fetch agent messages');
      }
    } catch (error) {
      console.error('Error fetching agent messages:', error);
    }
  };

  return (
    <div className="chat-container">
      <h1>Chat with Customer {customerId}</h1>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="new-message">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
