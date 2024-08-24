import json
import urllib.request
from datetime import datetime


def format_date(date_str):
    date_obj = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S.%fZ')
    return date_obj.strftime('%d-%b-%Y')

def calculate_days(start_date_str, end_date_str):
    start_date = datetime.strptime(start_date_str, '%Y-%m-%dT%H:%M:%S.%fZ')
    end_date = datetime.strptime(end_date_str, '%Y-%m-%dT%H:%M:%S.%fZ')
    return (end_date - start_date).days

def handle_booking_details_intent(slots, session_id):
    booking_id = slots['BookingId']['value']['interpretedValue']
    booking_id = booking_id.upper()
    
    if session_id == "Guest":
        return {
            "messages": [
                {
                    "content": "Please login before fetching details.",
                    "contentType": "PlainText"
                }
            ],
            "sessionState": {
                "dialogAction": {
                    "type": "Close",
                    "fulfillmentState": "Failed",
                    "message": {
                        "contentType": "PlainText",
                        "content": "Please login before fetching details."
                    }
                },
                "intent": {
                    "name": "BookingDetailsIntent",
                    "state": "Failed"
                }
            }
        }
    
    api_endpoint = f'https://2zhi4uaze6.execute-api.us-east-1.amazonaws.com/prod/bookings/getBookingDetails?bookingId={booking_id}'
    
    try:
        with urllib.request.urlopen(api_endpoint) as url:
            data = json.loads(url.read().decode())
            booking_details = data.get('details')
        start_date_formatted = format_date(booking_details.get('startDate'))
        end_date_formatted = format_date(booking_details.get('endDate'))
        num_days = calculate_days(booking_details.get('startDate'), booking_details.get('endDate'))
        
        message = f"Booking details for booking ID {booking_id}:\n"
        message += f"Room ID: {booking_details.get('roomId', 'N/A')}\n"
        message += f"Start Date: {start_date_formatted}\n"
        message += f"End Date: {end_date_formatted}\n"
        message += f"Number of Days: {num_days}\n"
        
        return {
            "messages": [
                {
                    "content": message,
                    "contentType": "PlainText"
                }
            ],
            "sessionState": {
                "dialogAction": {
                    "type": "Close",
                    "fulfillmentState": "Fulfilled",
                    "message": {
                        "contentType": "PlainText",
                        "content": message
                    }
                },
                "intent": {
                    "name": "BookingDetailsIntent",
                    "state": "Fulfilled"
                }
            }
        }
    
    except Exception as e:
        error_message = f"Error: {str(e)}"
        print(error_message)
        
        return {
            "messages": [
                {
                    "content": "Booking Not Found",
                    "contentType": "PlainText"
                }
            ],
            "sessionState": {
                "dialogAction": {
                    "type": "Close",
                    "fulfillmentState": "Failed",
                    "message": {
                        "contentType": "PlainText",
                        "content": "Booking Not Found"
                    }
                },
                "intent": {
                    "name": "BookingDetailsIntent",
                    "state": "Failed"
                }
            }
        }

def handle_customer_concern_intent(slots, session_id):
    booking_id = slots['BookingId']['value']['interpretedValue']
    concern = slots['Concern']['value']['interpretedValue']
    
    payload = {
        "customer_id": session_id,
        "concern": concern,
        "booking_reference": booking_id,
        "ticket_id": "TICKET001"
    }

    api_url = "https://us-central1-csci5410-427115.cloudfunctions.net/publishCustomerConcern"
    headers = {'Content-Type': 'application/json'}

    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(api_url, data=data, headers=headers)
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                message = "Your concern has been successfully recorded. We will address it shortly."
                fulfillment_state = "Fulfilled"
            else:
                message = "There was an error recording your concern. Please try again later."
                fulfillment_state = "Failed"
    except Exception as e:
        message = "There was an error recording your concern. Please try again later."
        fulfillment_state = "Failed"
        print(f"Error: {str(e)}")

    return {
        "messages": [
            {
                "content": message,
                "contentType": "PlainText"
            }
        ],
        "sessionState": {
            "dialogAction": {
                "type": "Close",
                "fulfillmentState": fulfillment_state,
                "message": {
                    "contentType": "PlainText",
                    "content": message
                }
            },
            "intent": {
                "name": "CustomerConcernIntent",
                "state": fulfillment_state
            }
        }
    }

def lambda_handler(event, context):
    print("Event received:", json.dumps(event))
    intent_name = event['interpretations'][0]['intent']['name']
    slots = event['interpretations'][0]['intent']['slots']
    session_id = event['sessionId']

    if intent_name == "BookingDetailsIntent":
        return handle_booking_details_intent(slots, session_id)
    elif intent_name == "CustomerConcernIntent":
        return handle_customer_concern_intent(slots, session_id)
    else:
        return {
            "messages": [
                {
                    "content": "Sorry, I didn't understand that.",
                    "contentType": "PlainText"
                }
            ],
            "sessionState": {
                "dialogAction": {
                    "type": "Close",
                    "fulfillmentState": "Failed",
                    "message": {
                        "contentType": "PlainText",
                        "content": "Sorry, I didn't understand that."
                    }
                },
                "intent": {
                    "name": intent_name,
                    "state": "Failed"
                }
            }
        
}
