import React, { useState, useEffect } from 'react';
import './agentTicketInfo.css';

const AgentTicketInfo = () => {
  const [messages, setMessages] = useState([]);
  const [agentId, setAgentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      console.log('AgentId from localStorage:', parsedUser.userId);
      setAgentId(parsedUser.userId);
    }
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (agentId) {
        try {
          const response = await fetch(`https://us-central1-csci5410-427115.cloudfunctions.net/getmesagesbyagent?agent_id=${agentId}`);
          if (response.ok) {
            const data = await response.json();
            setMessages(data);
          } else {
            console.error('Failed to fetch messages');
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        } finally {
          setLoading(false); // Set loading to false after the fetch is complete
        }
      }
    };

    // Initial fetch
    fetchMessages();

    // Fetch messages every 3 seconds
    const intervalId = setInterval(fetchMessages, 3000);

    // Cleanup interval on component unmount or when agentId changes
    return () => clearInterval(intervalId);
  }, [agentId]);

  return (
    <div className="agent-ticket-info">
      <h1>Agent Ticket Info</h1>
      {loading ? (
        <div className="loader">Loading...</div>
      ) : (
        messages.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Booking Reference</th>
                <th>Customer ID</th>
                <th>Ticket ID</th>
                <th>Concern</th>
                <th>Chat</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message, index) => (
                <tr key={index}>
                  <td>{message.booking_reference}</td>
                  <td>{message.customer_id}</td>
                  <td>{message.ticket_id}</td>
                  <td>{message.concern}</td>
                  <td><a className="chat-link" href={`/chat?customer_id=${message.customer_id}&booking_reference=${message.booking_reference}`}>Chat</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-messages">No messages found.</p>
        )
      )}
    </div>
  );
};

export default AgentTicketInfo;
