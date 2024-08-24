const admin = require('firebase-admin');
const functions = require('@google-cloud/functions-framework');

admin.initializeApp();
const database = admin.firestore();

functions.http('updateUserDetails', async (req, res) => {
    if (req.method === 'PUT') {
        const { username } = req.query;
        const { name, phone, address } = req.body;

        if (!username) {
            res.status(400).send({
                message: 'username parameter is required'
            });
            return;
        }

        try {
            const userRef = database.collection("users").where("username", "==", username).limit(1);
            const snapshot = await userRef.get();

            if (snapshot.empty) {
                res.status(404).send({
                    message: 'User not found'
                });
                return;
            }

            const userDoc = snapshot.docs[0];
            const userDocRef = userDoc.ref;

            // Update user data
            const updatedData = {};
            if (name) updatedData.name = name;
            if (phone) updatedData.phone = phone;
            if (address) updatedData.address = address;

            await userDocRef.update(updatedData);

            const updatedUserData = (await userDocRef.get()).data();

            res.status(200).json({
                message: "User updated successfully",
                user: updatedUserData
            });
        } catch (error) {
            console.error("Error updating user details:", error);
            res.status(500).send("Failed to update user details");
        }
    } else {
        res.status(405).send('Method Not Allowed');
    }
});
