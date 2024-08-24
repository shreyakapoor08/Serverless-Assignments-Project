import json
import boto3
import logging

# Initialize logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('users')

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        print(json.dumps(event))
        if 'queryStringParameters' in event and event['queryStringParameters'] is not None:
            user_id = event['queryStringParameters']['id']
            logger.info(f"Fetching details for user ID: {user_id}")
            
            # Fetch user details from DynamoDB
            response = table.get_item(
                Key={
                    'userId': user_id
                }
            )
            
            # Check if user exists
            if 'Item' in response:
                user_details = response['Item']
                logger.info(f"User details found: {json.dumps(user_details)}")
                return {
                    'statusCode': 200,
                    'body': json.dumps(user_details)
                }
            else:
                logger.warning(f"User ID {user_id} not found")
                return {
                    'statusCode': 404,
                    'body': json.dumps({'error': 'User not found'})
                }
        else:
            logger.error("'pathParameters' not found in the event or is None")
            return {
                'statusCode': 400,
                'body': json.dumps({'error': "'pathParameters' not found in the event or is None"})
            }
            
    except Exception as e:
        logger.error(f"Error fetching user details: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Could not fetch user details', 'message': str(e)})
        }
