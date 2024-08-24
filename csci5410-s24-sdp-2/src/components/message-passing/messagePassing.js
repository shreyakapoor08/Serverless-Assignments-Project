import React, { useState, useEffect } from 'react';
import './messagePassing.css';

const MessagePassing = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [concern, setConcern] = useState('');
  const [bookingReference, setBookingReference] = useState('');
  const [chatVisible, setChatVisible] = useState(false);
  const [agentAssigned, setAgentAssigned] = useState(false);
  const [agentID, setAgent] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      console.log('UserId from localStorage:', parsedUser.userId);
      setUserId(parsedUser.userId);
    }
  }, []);

  const generateTicketId = () => {
    const datePart = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 8);
    const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${datePart}${randomPart}`;
  };

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
      customer_id: userId,
      agent_id: agentID,
      message: message.text,
      sender_number: '1',
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
            sender: msg.sender_number === '1' ? 'user' : 'receiver',
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

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ticketId = generateTicketId();
    const message = {
      customer_id: userId,
      concern,
      booking_reference: bookingReference,
      ticket_id: ticketId,
    };

    if (!message.customer_id || !message.concern || !message.booking_reference || !message.ticket_id) {
      console.log('All fields are required');
      return;
    }

    try {
      const response = await fetch('https://us-central1-csci5410-427115.cloudfunctions.net/publishCustomerConcern', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        console.log('Message sent successfully');
        setConcern('');
        setChatVisible(true);
        setTimeout(() => {
          fetchBookingReferenceDetails();
        }, 5000);
      } else {
        console.log('Failed to send message');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchBookingReferenceDetails = async () => {
    try {
      const response = await fetch(`https://us-central1-csci5410-427115.cloudfunctions.net/function-1?booking_reference=${bookingReference}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Booking reference details:', data);

        setAgentAssigned(true);

        if (data.length > 0) {
          const item = data[0];
          const agentAssignmentMessage = {
            text: `You have been assigned an agent. Agent ID: ${item.agent_id}, Ticket ID: ${item.ticket_id}`,
            timestamp: new Date(),
            sender: 'system',
          };
          setMessages([agentAssignmentMessage]);
          setAgent(item.agent_id);
        }
      } else {
        console.log('Failed to fetch booking reference details');
      }
    } catch (error) {
      console.error('Error fetching booking reference details:', error);
    }
  };

  return (
    <div className="message-passing">
      <h1>Message Passing</h1>
      <form onSubmit={handleSubmit} className="concern-form">
        <div>
          <label htmlFor="concern">Concern:</label>
          <input
            type="text"
            id="concern"
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="bookingReference">Booking Reference:</label>
          <input
            type="text"
            id="bookingReference"
            value={bookingReference}
            onChange={(e) => setBookingReference(e.target.value)}
          />
        </div>
        <button type="submit">Submit</button>
      </form>

      <div className={`chat-window ${chatVisible ? 'show' : ''}`}>
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div key={index} className={`chat-message ${message.sender}`}>
              <span>{message.text}</span>
            </div>
          ))
        ) : (
          <div className="no-messages">No messages yet</div>
        )}
      </div>

      {chatVisible && (
        <div className="chat-input">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      )}

      {agentAssigned && (
        <div className="agent-assigned-message">
          <p>You have been assigned an agent. <br/> KINDLY SEND A MESSAGE TO START CONVERSATION </p>
        </div>
      )}
    </div>
  );
};

export default MessagePassing;
