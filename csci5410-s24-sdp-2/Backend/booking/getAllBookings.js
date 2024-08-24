import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromEnv } from "@aws-sdk/credential-providers";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDb = new DynamoDBClient({ region: "us-east-1", credentials: fromEnv() });

export const handler = async(event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: ''
        };
    }
    
    const body = JSON.parse(event.body);
    const userId = body.userId;

    if (!userId) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({ message: "userId is required" })
        };
    }
    
    const params = {
        TableName: 'Bookings',
        IndexName: 'UserIdIndex',
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId
        }
    };

    try{
        const data = await dynamoDb.send(new QueryCommand(params));

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({message: "Successfully retrieved bookings", bookings: data.Items})
        }
    } 
    catch(error){
        console.log(error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({message: "Could not retrieve bookings"})
        };
    }


}