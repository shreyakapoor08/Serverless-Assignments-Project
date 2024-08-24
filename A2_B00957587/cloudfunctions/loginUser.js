const admin = require('firebase-admin');
const functions = require('@google-cloud/functions-framework');
 
admin.initializeApp();
const database = admin.firestore();
 
functions.http('loginUser', async (req, res) => {
 
    if (req.method === 'POST') {
      const user = req.body;
      console.log("Body", req.body);
      if (!user.username || !user.password) {
        res.status(400).send({
           message: 'Invalid login credentials'
          });
        return;
      }
 
      try {
        const userRef = database.collection("users").where("username", "==", user.username).limit(1);
        const snapshot = await userRef.get();
 
        if (snapshot.empty) {
          console.error("Empty Snapshot");
          res.status(401).send(
            {
           message: 'Invalid username or password'
          });
          return;
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        
        if (userData.password !== user.password) {
          console.error("Invalid Password entered");
          res.status(401).send({
           message: 'Invalid username or password'
          });
          return;
        }
 
        const responseData = {
          message: "User log in Successfully",
        };
 
        res.status(200).json(responseData);
      } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).send("Failed to log in user");
      }
    } else {
      res.status(405).send('Method Not Allowed');
    }
});