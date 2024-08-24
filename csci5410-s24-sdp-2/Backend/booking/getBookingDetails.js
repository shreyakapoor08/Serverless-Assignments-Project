import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { fromEnv } from "@aws-sdk/credential-providers";

const dynamoDb = new DynamoDBClient({ region: "us-east-1", credentials: fromEnv() });

export const handler = async(event) => {
    const bookingId = event.queryStringParameters.bookingId;

    if(!bookingId){
        return {
            statusCode:400,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({message: "Booking ID is required"})
        }
    }

    const params = {
        TableName: 'Bookings',
        Key: {
            bookingId: { S: bookingId },
        }
    };

    try{
        const { Item } = await dynamoDb.send(new GetItemCommand(params));

        if(!Item){
            return {
                statusCode: 404,
                body: JSON.stringify({message:"Booking not found"})
            }
        }

        const bookingDetails = {
            bookingId: Item.bookingId.S,
            userId: Item.userId.S,
            roomId: Item.roomId.S,
            roomName: Item.roomName.S,
            startDate: Item.startDate.S,
            endDate: Item.endDate.S,
            status: Item.status.S,
          };

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({message: "Booking found", details: bookingDetails})
        }
    }
    catch(error){
        console.error(error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({message: 'Error while retrieving the booking details.'})
        };
    }
}