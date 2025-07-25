import boto3
import os
import base64
import json

s3 = boto3.client("s3")
BUCKET = os.environ["PHOTO_BUCKET"]

def lambda_handler(event, context):
    try:
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

        # Récupération JSON { "base64": "..." }
        data = json.loads(event.get("body", "{}"))
        base64_data = data.get("base64")
        if not base64_data:
            raise ValueError("Aucune image reçue")

        image_bytes = base64.b64decode(base64_data)

        # 📌 Sauvegarder avec extension .jpg
        key = f"profile_photos/{user_id}.jpg"

        s3.put_object(
            Bucket=BUCKET,
            Key=key,
            Body=image_bytes,
            ContentType="image/jpeg"
        )

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            "body": json.dumps({"message": "Upload réussi"})
        }

    except Exception as e:
        print("Erreur:", e)
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": "Erreur lors de l'upload"})
        }
