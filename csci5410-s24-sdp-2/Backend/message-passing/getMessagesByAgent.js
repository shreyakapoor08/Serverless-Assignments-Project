const functions = require('@google-cloud/functions-framework');
const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore({
  projectId: 'csci5410-427115', 
  databaseId: 'csci5410'
});

exports.getMessagesByAgent = async (req, res) => {
  // Set CORS headers for the response
  res.set('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allow specific HTTP methods
  res.set('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(204).send(''); // No content
  }

  const agentId = req.query.agent_id;

  if (!agentId) {
    res.status(400).send('Agent ID is required.');
    return;
  }

  try {
    // Query Firestore for documents with the specified agent ID
    const querySnapshot = await firestore.collection('customerMessages')
      .where('agent_id', '==', agentId)
      .get();

    if (querySnapshot.empty) {
      res.status(404).send('No messages found for the given agent ID.');
      return;
    }

    // Collect the data from the query results
    const messages = [];
    querySnapshot.forEach(doc => {
      messages.push(doc.data());
    });

    // Log the retrieved data
    console.log(`Retrieved messages for agent ID ${agentId}:`, messages);

    // Send the retrieved data as the response
    res.status(200).json(messages);
  } catch (err) {
    console.error('Error retrieving messages:', err);
    res.status(500).send('Internal Server Error');
  }
};

