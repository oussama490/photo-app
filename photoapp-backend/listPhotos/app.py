import boto3
import os
import json
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['PHOTO_LABELS_TABLE'])
s3 = boto3.client('s3')
bucket_name = os.environ['BUCKET_NAME']

def lambda_handler(event, context):
    try:
        # Authentification via Cognito
        claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
        user_id = claims.get('sub')
        if not user_id:
            raise Exception("Utilisateur non authentifié")

        # Récupération de l'albumId s’il est dans l’URL
        params = event.get('queryStringParameters') or {}
        album_id = params.get('albumId')

        # Filtrage DynamoDB par userId (et albumId si fourni)
        filter_expr = Attr('userId').eq(user_id)
        if album_id:
            filter_expr = filter_expr & Attr('albumId').eq(album_id)

        # Scan DynamoDB
        response = table.scan(FilterExpression=filter_expr)
        items = response.get('Items', [])

        photos = []
        for item in items:
            photo_key = item.get("photo")

            # Générer une URL de téléchargement
            download_url = s3.generate_presigned_url(
                ClientMethod='get_object',
                Params={
                    'Bucket': bucket_name,
                    'Key': photo_key,
                    'ResponseContentDisposition': 'attachment'
                },
                ExpiresIn=3600
            )

            photos.append({
                "photo": photo_key,
                "labels": item.get("labels", []),
                "albumId": item.get("albumId", None),
                "description": item.get("description", ""),
                "location": item.get("location", ""),
                "uploadedAt": item.get("uploadedAt", None),
                "download_url": download_url,
                "isFavorite": item.get("isFavorite", False)  # ✅ Correction ici
            })

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "GET,OPTIONS"
            },
            "body": json.dumps(photos)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "GET,OPTIONS"
            },
            "body": json.dumps({"error": str(e)})
        }
