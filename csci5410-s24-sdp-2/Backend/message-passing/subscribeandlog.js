const { Firestore } = require('@google-cloud/firestore');
const axios = require('axios');

const firestore = new Firestore({
  projectId: 'csci5410-427115', 
  databaseId: 'csci5410'
});

exports.subscribeAndLog = async (message, context) => {
  const data = JSON.parse(Buffer.from(message.data, 'base64').toString());

  // Validate message content
  if (!data.customer_id || !data.concern || !data.booking_reference || !data.ticket_id) {
    console.error('Invalid message format. Must include customer_id, concern, booking_reference, and ticket_id');
    return;
  }

  try {
    // Make a GET request to the AWS API to get users with the role 'property agent'
    const response = await axios.get('AWS_API_URL_HERE'); // Replace with your actual AWS API URL

    // Extract the list of agents from the response
    const agents = response.data.filter(user => user.role === 'propertyAgent');

    if (agents.length === 0) {
      console.error('No property agents found.');
      return;
    }

    // Select a random agent
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    const agentId = randomAgent.userId;

    // Add the agentId to the data
    const dataWithAgent = {
      ...data,
      agent_id: agentId
    };

    // Log to Firestore
    const docRef = firestore.collection('customerMessages').doc();
    await docRef.set(dataWithAgent);

    // Simulate forwarding to property agent
    console.log(`Forwarding message to agent ${JSON.stringify(dataWithAgent)}`);
  } catch (err) {
    console.error('Error:', err);
  }
};
