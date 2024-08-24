const { Storage } = require('@google-cloud/storage');

const storage = new Storage();
const bucketName = 'usermetrics';
const fileName = 'logs/userdata.csv';

exports.logUserLogin = async (req, res) => {
    // Set CORS headers for the response
    res.set('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allow specific HTTP methods
    res.set('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(204).send(''); // No content
    }

    try {
        const { userId } = req.body;
        const loginTimestamp = new Date();
        const loginDate = loginTimestamp.toISOString().split('T')[0]; // Extract the date part
        const loginTime = loginTimestamp.toISOString().split('T')[1]; // Extract the time part

        if (!userId) {
            return res.status(400).send('No userId provided.');
        }

        const logData = `${userId},${loginDate},${loginTime}\n`;

        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);

        // Download the existing file, if it exists
        const [exists] = await file.exists();
        let currentContent = '';
        if (exists) {
            currentContent = (await file.download()).toString();
        } else {
            // Add headers if the file does not exist
            currentContent = 'userId,loginDate,loginTime\n';
        }

        // Append the new log data
        const updatedContent = currentContent + logData;

        // Upload the updated file
        await file.save(updatedContent, {
            contentType: 'text/csv'
        });

        res.status(200).send('Log written successfully.');
    } catch (error) {
        console.error('Error writing log:', error);
        res.status(500).send('Error writing log.');
    }
};
