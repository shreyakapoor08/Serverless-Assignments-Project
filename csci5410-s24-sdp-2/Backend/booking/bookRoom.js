import { DynamoDBClient, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const dynamoDb = new DynamoDBClient({ region: "us-east-1" });
const sns = new SNSClient({ region: "us-east-1" });

function formatDate(isoDateString) {
    const date = new Date(isoDateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short'
    });
}

export const handler = async (event) => {
    for (const record of event.Records) {
        let body;

        try {
            body = JSON.parse(record.body);
        } catch (error) {
            console.error("Invalid JSON format:", record.body);
            continue;
        }

        const { userId, roomId, roomName, startDate, endDate } = body;

        if (!userId || !roomId || !roomName || !startDate || !endDate) {
            console.error("Missing required fields:", body);
            continue;
        }

        const start = new Date(startDate).toISOString();
        const end = new Date(endDate).toISOString();
        
        
         const queryParams = {
            TableName: 'Bookings',
            IndexName: 'RoomIdIndex',
            KeyConditionExpression: 'roomId = :roomId',
            ExpressionAttributeValues: {
                ':roomId': { S: roomId }
            }
        };
        

        try {
            const currentBookings = await dynamoDb.send(new QueryCommand(queryParams));
 
            const isRoomAvailable = currentBookings.Items.every((item) => {
                const itemStartDate = new Date(item.startDate.S);
                const itemEndDate = new Date(item.endDate.S);

                return !(start <= itemEndDate.toISOString() && end >= itemStartDate.toISOString());
            });
            
            if (!isRoomAvailable) {
                console.error("Room already booked:", roomId);
                throw new Error("Room already booked.");
            }

            const bookingId = generateId();
            const bookingParams = {
                TableName: 'Bookings',
                Item: {
                    bookingId: { S: bookingId },
                    userId: { S: userId },
                    roomId: { S: roomId },
                    roomName: { S: roomName },
                    startDate: { S: start },
                    endDate: { S: end },
                    status: { S: 'Booked' }
                }
            };

            await dynamoDb.send(new PutItemCommand(bookingParams));

            const subject = "Room booked successfully";
            const message = `
                Dear User,

                We are pleased to confirm you booking for ${roomName} at DalVacationHome.
                Below are the details of your booking:

                Booking id: ${bookingId}
                Room name: ${roomName}
                Checkin date: ${formatDate(startDate)}
                Checkout date: ${formatDate(endDate)}
            `;

            await sns.send(new PublishCommand({
                Subject: subject,
                Message: message,
                TopicArn: 'arn:aws:sns:us-east-1:960148008907:Booking',
                MessageAttributes: {
                UserId: {
                    DataType: 'String',
                    StringValue: userId,
                    },
                },
            }));

            console.log("Room booked successfully:", message);
        } catch (error) {
            const subject = "Room booking failed";
            const message = `Sorry to inform you, but your booking for room ${roomName} could not be completed`;
            
            await sns.send(new PublishCommand({
                Subject: subject,
                Message: message,
                TopicArn: 'arn:aws:sns:us-east-1:960148008907:Booking',
                MessageAttributes: {
                    UserId: {
                        DataType: 'String',
                        StringValue: userId,
                        },
                    },
              }));
            console.error("Error processing booking:", error);
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Processing complete" }),
    };
};

function generateId() {
    const idLength = 6;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';

    for (let i = 0; i < idLength; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}
