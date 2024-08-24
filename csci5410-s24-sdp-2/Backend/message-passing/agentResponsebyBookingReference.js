const functions = require('@google-cloud/functions-framework');
const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore({
  projectId: 'csci5410-427115',
  databaseId: 'csci5410'
});

exports.getAgentResponseByBookingReference = async (req, res) => {
  // Set CORS headers for the response
  res.set('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS'); // Allow specific HTTP methods
  res.set('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(204).send(''); // No content
  }

  // Extract bookingReference from query parameters
  const { bookingReference } = req.query;

  if (!bookingReference) {
    res.status(400).send('Booking Reference is required.');
    return;
  }

  try {
    // Query Firestore for agent response data
    const responseRef = firestore.collection('agentResponses').doc(bookingReference);
    const doc = await responseRef.get();

    if (!doc.exists) {
      res.status(404).send('No agent response found for the booking reference.');
      return;
    }

    const responseData = doc.data();
    res.status(200).json(responseData);
  } catch (err) {
    console.error('Error fetching agent response:', err);
    res.status(500).send('Internal Server Error');
  }
};
