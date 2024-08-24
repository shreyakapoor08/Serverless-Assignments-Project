import json
import boto3
import hashlib

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('users')

def lambda_handler(event, context):
    # Parse incoming request data
    body = json.loads(event['body'])
    user_id = body['userId']
    first_name = body['firstName']
    last_name = body['lastName']
    phone_number = body['phoneNumber']
    email = body['email']
    security_questions = body['securityQuestions']
    user_role = body['user_role']

    # Hash the security answers
    hashed_security_questions = [
        {
            'question': q['question'],
            'answer': hashlib.sha256(q['answer'].encode()).hexdigest()
        }
        for q in security_questions
    ]

    # Save to DynamoDB
    try:
      table.put_item(
        Item={
            'userId': user_id,
            'firstName': first_name,
            'lastName': last_name,
            'phoneNumber': phone_number,
            'email': email,
            'securityQuestions': hashed_security_questions,
            'user_role': user_role
          }
       )

      return {
          'statusCode': 200,
          'body': json.dumps('User details stored successfully')
      }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Could not store user details', 'message': str(e)})
        }