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
            
        # Fetch all user details from DynamoDB
        response = table.scan()
        
        print(response)    
            # Check if user exists
        if 'Items' in response:
            users = response['Items']
            print("All users -----> ", users)
            return {
                'statusCode': 200,
                'body': users
            }
        else:
            logger.warning("Unable to fetch all users")
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'User not found'})
            }
        
    except Exception as e:
        logger.error(f"Error fetching user details: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Could not fetch user details', 'message': str(e)})
        }
