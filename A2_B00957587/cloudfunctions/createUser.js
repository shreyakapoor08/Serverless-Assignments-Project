const admin = require('firebase-admin');
const functions = require('@google-cloud/functions-framework');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
 
admin.initializeApp();
const database = admin.firestore();
 
const bucket = storage.bucket('serverless-activity-sk')

functions.http('createUser', async (req, res) => {
 
    if (req.method === 'POST') {
      const user = req.body;
      // No user present in the body
      if (!user) {
        res.status(400).send(JSON.stringify(user));
        return;
      }
 
      try {
        const buffer = Buffer.from(user.image.split(",")[1], 'base64');
        const fileName = `${user.username}.png`;
        const file = bucket.file(fileName);
 
        await file.save(buffer, {
          metadata: { contentType: "image/png" },
          public: true,
        });
 
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
 
        const userData = {
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          password: user.password,
          image: imageUrl,
          address: user.address
        };
 
        await database.collection("users").doc(user.username).set(userData);
        res.status(201).json({ id: user.username });
      } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send("Failed to register user");
      }
    } else {
      res.status(405).send('Method Not Allowed');
    }
});