import json
import boto3
import uuid
import os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['ALBUMS_TABLE'])

def lambda_handler(event, context):
    try:
        print("EVENT:", json.dumps(event))  # Debug

        body = json.loads(event.get("body", "{}"))
        album_name = body.get("name")

        if not album_name:
            return response(400, {"message": "Nom d'album manquant"})

        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        album_id = str(uuid.uuid4())

        item = {
            "albumId": album_id,
            "userId": user_id,
            "name": album_name
        }

        table.put_item(Item=item)

        return response(201, {
            "message": "Album créé avec succès",
            "albumId": album_id
        })

    except Exception as e:
        print("Erreur:", str(e))
        return response(500, {"message": str(e)})

def response(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Methods": "POST, OPTIONS"
        },
        "body": json.dumps(body)
    }
