import json
import random
import hashlib
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('users')

def generate_caesar_cipher(text, shift):
    result = ""
    for i in range(len(text)):
        char = text[i]
        if char.isupper():
            result += chr((ord(char) + shift - 65) % 26 + 65)
        else:
            result += chr((ord(char) + shift - 97) % 26 + 97)
    return result

def lambda_handler(event, context):
    user_id = event['queryStringParameters']['userId']
    
    shift = random.randint(1, 7)
    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    plaintext = ''.join(random.choices(alphabet, k=5)) 
    cipher_text = generate_caesar_cipher(plaintext, shift)
    
    hashed_answer = hashlib.sha256(plaintext.encode()).hexdigest()
    
    response = table.update_item(
        Key={'userId': user_id},
        UpdateExpression="set cipher = :c,hashed_answer = :h",
        ExpressionAttributeValues={
            ':c': cipher_text,
            ':h': hashed_answer
        },
        ReturnValues="UPDATED_NEW"
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'challenge': cipher_text,
            'key': shift
        })
    }
