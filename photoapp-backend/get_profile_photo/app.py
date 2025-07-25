import json
import boto3
import os

s3 = boto3.client("s3")
BUCKET = os.environ["PHOTO_BUCKET"]

def lambda_handler(event, context):
    try:
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        key = f"profile_photos/{user_id}.jpg"

        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": BUCKET, "Key": key},
            ExpiresIn=3600
        )

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"url": url})
        }

    except Exception as e:
        print("Erreur:", e)
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": "Erreur lors de la récupération de la photo"})
        }
