import json
import boto3
import os

user_pool_id = os.environ.get('USERPOOL_ID')

def lambda_handler(event, context):
    print("Event", event)
    body = json.loads(event['body'])
    email = body['email']

    client = boto3.client('cognito-idp')

    try:
        response = client.admin_confirm_sign_up(
            UserPoolId=user_pool_id,
            Username=email
        )
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User confirmed successfully!'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Could not confirm user', 'message': str(e)})
        }