import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get("ALBUMS_TABLE")
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    album_id = event["pathParameters"]["albumId"]
    
    try:
        table.delete_item(Key={"albumId": album_id})
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"message": "Album supprimé"})
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": str(e)})
        }
