import json
import hashlib
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('users')

def lambda_handler(event, context):
    data = json.loads(event['body'])
    user_id = data['userId']
    user_answer = data['answer']
    
    response = table.get_item(Key={'userId': user_id})
    item = response.get('Item', {})
    
    if not item:
        return {
            'statusCode': 400,
            'body': json.dumps({'success': False, 'message': 'Invalid request.'})
        }
    
    hashed_user_answer = hashlib.sha256(user_answer.encode()).hexdigest()
    
    if hashed_user_answer == item['hashed_answer']:
        return {
            'statusCode': 200,
            'body': json.dumps({'success': True, 'user_role': item['user_role']})
        }
    else:
        return {
            'statusCode': 400,
            'body': json.dumps({'success': False, 'message': 'Incorrect answer.'})
        }
