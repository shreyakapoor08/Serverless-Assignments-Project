import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({ region: "us-east-1" });

const headers = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST"
};

const bucketName = "sdp2-room-images";

export const handler = async (event) => {
    const body = event.body ? JSON.parse(event.body) : {};

    if (!body.image || !body.key) {
        return {
            statusCode: 400,
            headers: headers,
            body: JSON.stringify({ message: "Missing required parameters" })
        };
    }

    let { image, key } = body;
    
    const extension = key.split('.').pop().toLowerCase();
    let contentType = 'application/octet-stream';

    switch (extension) {
        case 'jpg':
        case 'jpeg':
            contentType = 'image/jpeg';
            key = key;
            break;
        case 'png':
            contentType = 'image/png';
            key = key;
            break;
        case 'gif':
            contentType = 'image/gif';
            key = key;
            break;
        default:
            contentType = 'application/octet-stream';
    }

    try {
        const buffer = Buffer.from(image, 'base64');
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentEncoding: 'base64',
            ContentType: contentType,
            ACL: 'public-read'
        });

        await client.send(command);

        const objectUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;

        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({ message: "Image uploaded successfully", url: objectUrl })
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({ message: error.message })
        };
    }
};
