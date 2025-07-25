import os
import json
import boto3
import uuid

s3 = boto3.client('s3')
bucket_name = os.environ['BUCKET_NAME']

def lambda_handler(event, context):
    photo_id = str(uuid.uuid4())
    photo_key = f"photo/{photo_id}.jpg"

    try:
        # URL signée pour uploader l'image
        upload_url = s3.generate_presigned_url(
            ClientMethod='put_object',
            Params={
                'Bucket': bucket_name,
                'Key': photo_key,
                'ContentType': 'image/jpeg'
            },
            ExpiresIn=3600
        )

        # URL signée pour téléchargement avec Content-Disposition: attachment
        download_url = s3.generate_presigned_url(
            ClientMethod='get_object',
            Params={
                'Bucket': bucket_name,
                'Key': photo_key,
                'ResponseContentDisposition': 'attachment'  # 👈 force le téléchargement
            },
            ExpiresIn=3600
        )

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            "body": json.dumps({
                "upload_url": upload_url,
                "photo_key": photo_key,
                "download_url": download_url  # 👈 ajout ici
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            "body": json.dumps({ "message": str(e) })
        }
