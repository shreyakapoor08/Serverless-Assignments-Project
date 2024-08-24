const admin = require('firebase-admin');
const functions = require('@google-cloud/functions-framework');

admin.initializeApp();
const database = admin.firestore();

functions.http('deleteUser', async (req, res) => {
    
    if (req.method === 'DELETE') {
        const { username } = req.query;

        if (!username) {
            res.status(400).send({
                message: 'username parameter is required'
            });
            return;
        }

        try {
            const userRef = database.collection("users").doc(username);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                res.status(404).send({
                    message: 'User not found'
                });
                return;
            }

            await userRef.delete();

            res.status(200).json({
                message: "User profile deleted successfully"
            });
        } catch (error) {
            console.error("Error deleting user profile:", error);
            res.status(500).send("Failed to delete user profile");
        }
    } else {
        res.status(405).send('Method Not Allowed');
    }
});
