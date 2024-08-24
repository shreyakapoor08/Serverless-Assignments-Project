import json
import boto3
import hashlib

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('users')

def lambda_handler(event, context):
    print(json.dumps(event))
    body = json.loads(event['body'])
    user_id = body['userId']
    answers = body['answers']

    response = table.get_item(
        Key={'userId': user_id}
    )
    
    if 'Item' in response:
        user_details = response['Item']
        security_questions = user_details['securityQuestions']

        for i, question in enumerate(security_questions):
            hashed_answer = hashlib.sha256(answers[i].encode()).hexdigest()
            if question['answer'] != hashed_answer:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'error': 'Incorrect answer'})
                }

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Verification successful'})
        }
    else:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'User not found'})
        }
