const functions = require('firebase-functions');
const admin = require('firebase-admin');
const language = require('@google-cloud/language');

// Firebase Admin SDK with default credentials
admin.initializeApp();
const db = admin.firestore();

// Initialize Google Cloud Natural Language client
const client = new language.LanguageServiceClient();

exports.sentimentAnalysis = functions.firestore
  .document('feedbacks/{feedbackId}')
  .onCreate(async (snap, context) => {
    const feedback = snap.data();
    const document = {
      content: feedback.message + " " + feedback.title,
      type: 'PLAIN_TEXT',
    };

    try {
      const [result] = await client.analyzeSentiment({document});
      const sentiment = result.documentSentiment;
      console.log("Sentiment ", sentiment);

      await db.collection('feedbacks').doc(context.params.feedbackId).update({
        sentiment: sentiment.score,
      });
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    }
  });
