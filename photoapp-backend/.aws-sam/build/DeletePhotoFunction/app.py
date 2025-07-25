import boto3
import os
import json

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

def lambda_handler(event, context):
    try:
        print("📦 Event reçu:", json.dumps(event))

        body = json.loads(event.get("body", "{}"))
        photo_key = body.get("photo")

        if not photo_key:
            return response(400, {"message": "❌ Clé 'photo' manquante dans le corps de la requête."})

        # 🔥 Supprimer le fichier dans S3
        bucket_name = os.environ['BUCKET_NAME']
        s3.delete_object(Bucket=bucket_name, Key=photo_key)
        print(f"🗑️ Fichier S3 supprimé: {photo_key}")

        # 🧹 Supprimer l'entrée DynamoDB
        table.delete_item(Key={"photo": photo_key})
        print(f"📄 Entrée DynamoDB supprimée: {photo_key}")

        return response(200, {"message": "✅ Photo supprimée avec succès."})

    except Exception as e:
        print("⚠️ Erreur pendant la suppression:", str(e))
        return response(500, {"message": f"Erreur : {str(e)}"})

def response(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "DELETE, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        },
        "body": json.dumps(body)
    }
