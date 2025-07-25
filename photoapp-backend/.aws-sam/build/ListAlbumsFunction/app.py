import boto3
import os
import json
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['ALBUMS_TABLE'])

def lambda_handler(event, context):
    try:
        claims = event.get("requestContext", {}).get("authorizer", {}).get("claims", {})
        user_id = claims.get("sub")

        if not user_id:
            raise Exception("Utilisateur non authentifié")

        # ⚠️ Utiliser Attr car pas d’index GSI
        response = table.scan(
            FilterExpression=Attr("userId").eq(user_id)
        )

        albums = response.get("Items", [])

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "GET,OPTIONS"
            },
            "body": json.dumps({ "albums": albums })
        }

    except Exception as e:
        print("❌ Erreur ListAlbums:", str(e))
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "GET,OPTIONS"
            },
            "body": json.dumps({ "error": str(e) })
        }
