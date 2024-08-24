import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { fromEnv } from "@aws-sdk/credential-providers";

const dynamoDb = new DynamoDBClient({ region: "us-east-1", credentials: fromEnv() });

export const handler = async(event)=>{
    const body = event.body ? JSON.parse(event.body) : null;
    let userId, bookingId;    
    if (body) {
        userId = body.userId;
        bookingId = body.bookingId;
    }

    if (!userId || !bookingId) {
        console.log("event:"+ event.body+ "body:"+ body);
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({ message: "userId and bookingId are required" })
        };
    }
    
    const params = {
        TableName: "Bookings",
        Key: {
            bookingId: bookingId
        }
    }

    try {
        await dynamoDb.send(new DeleteCommand(params));

        return {
          statusCode: 200,
          headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
          body: JSON.stringify({ message: "Booking deleted successfully"}),
        };
    } 
    catch (error) {
        console.log(error);
        return {
          statusCode: 500,
          headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
          body: JSON.stringify({ message: "Could not delete booking" }),
        };
    }
};

