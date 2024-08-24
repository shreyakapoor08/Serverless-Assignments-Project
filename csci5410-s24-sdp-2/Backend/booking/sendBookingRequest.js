import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: "us-east-1" });

export const handler = async (event) => {
    const { userId, roomId, roomName, startDate, endDate } = JSON.parse(event.body);

    if (!userId || !roomId || !roomName || !startDate || !endDate) {
        return {
            statusCode: 400,
             headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({ message: "Please provide all required fields" })
        };
    }

    const message = {
        userId,
        roomId,
        roomName,
        startDate,
        endDate,
    };

    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/960148008907/BookingQueue';

    const params = {
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message),
    };

    try {
        await sqs.send(new SendMessageCommand(params));
        return {
            statusCode: 200,
             headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({ message: "Booking request added to SQS queue" })
        };
    } catch (error) {
        console.error('Error adding message to SQS queue:', error);
        return {
            statusCode: 500,
             headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({ message: 'Failed to add booking request to SQS queue' })
        };
    }
};
