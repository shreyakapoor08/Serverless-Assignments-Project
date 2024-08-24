import { SNSClient, PublishCommand  } from "@aws-sdk/client-sns";

const sns = new SNSClient({ region: "us-east-1" });

const topicArn = 'arn:aws:sns:us-east-1:960148008907:Login';

export const handler = async(event) => {
    const {userId, email} = JSON.parse(event.body);

    if(!userId || !email){
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({message: "Please pass all the fields"})
        };
    }

    const subject = "Welcome to DalVacationHome!";
    const currentDate = new Date();
    const message = `Hello User,
    
You have recently logged in to DalVacationHome at ${currentDate}.
    `;
    try{

        await sns.send(new PublishCommand({
            Message: message,
            Subject: subject,
            MessageAttributes: {
                UserId: {
                    DataType: 'String',
                    StringValue: userId,
                    },
                },
            TopicArn: topicArn
          }));
      

        return {
            statusCode: 201,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({message: "Email sent successfully!", details: message})
        };
    }
    catch(error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({message: "Failed to send email."})
        };
    }
    

};