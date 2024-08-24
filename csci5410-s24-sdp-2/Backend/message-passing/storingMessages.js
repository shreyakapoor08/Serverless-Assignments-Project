const functions = require('@google-cloud/functions-framework');
const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore({
  projectId: 'csci5410-427115', 
  databaseId: 'csci5410'
});

exports.storingMessages = async (req, res) => {
  // Set CORS headers for the response
  res.set('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Allow specific HTTP methods
  res.set('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(204).send(''); // No content
  }

  // Extract data from request body
  const { bookingReference, customer_id, agent_id, message, sender_number } = req.body;

  if (!bookingReference || !customer_id || !agent_id || !message || !sender_number) {
    res.status(400).send('Missing required parameters.');
    return;
  }

  try {
    // Check if the booking reference already exists in agentResponses collection
    const responseRef = firestore.collection('agentResponses').doc(bookingReference);
    const doc = await responseRef.get();

    if (doc.exists) {
      // Update existing document
      const existingData = doc.data();
      const updatedMessages = existingData.messages || [];

      updatedMessages.push({ message, sender_number });

      await responseRef.update({
        messages: updatedMessages,
      });
    } else {
      // Create new document
      await responseRef.set({
        bookingReference,
        customer_id,
        agent_id,
        messages: [{ message, sender_number }],
      });
    }

    res.status(200).send('Agent response stored successfully.');
  } catch (err) {
    console.error('Error storing agent response:', err);
    res.status(500).send('Internal Server Error');
  }
};
