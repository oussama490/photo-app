import boto3
import os
import json
import io
from datetime import datetime
from PIL import Image, ImageEnhance

rekognition = boto3.client('rekognition')
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

def lambda_handler(event, context):
    try:
        print("EVENT:", json.dumps(event))

        if 'body' in event:
            body = json.loads(event.get('body', '{}'))
            photo_key = body.get('photo')
            album_id = body.get('albumId')
            description = body.get('description', '')
            location = body.get('location', '')
            bucket_name = os.environ['BUCKET_NAME']

            claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
            user_id = claims.get('sub')

            # ✅ Appliquer le traitement image
            process_image(bucket_name, photo_key)

            return analyze_and_save(
                bucket=bucket_name,
                key=photo_key,
                user_id=user_id,
                album_id=album_id,
                description=description,
                location=location,
                cors=True
            )

        elif 'Records' in event:
            for record in event['Records']:
                bucket = record['s3']['bucket']['name']
                key = record['s3']['object']['key']

                process_image(bucket, key)  # ✅ Traitement auto via S3

                analyze_and_save(bucket, key, cors=False)

            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'Analyse S3 réussie.'})
            }

        else:
            return {
                'statusCode': 400,
                'headers': default_cors(),
                'body': json.dumps({'message': 'Format d’événement non reconnu.'})
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': default_cors(),
            'body': json.dumps({'message': f"Erreur : {str(e)}"})
        }

def process_image(bucket, key):
    try:
        # Télécharger l’image originale depuis S3
        response = s3.get_object(Bucket=bucket, Key=key)
        image_bytes = response['Body'].read()

        # Ouvrir l’image
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert("RGB")  # ✅ Assure compatibilité JPEG

        # Resize max 1024x768
        image.thumbnail((1024, 768))

        # Améliorer contraste et luminosité
        image = ImageEnhance.Contrast(image).enhance(1.2)
        image = ImageEnhance.Brightness(image).enhance(1.1)

        # Sauvegarder dans un buffer
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG', quality=85)
        buffer.seek(0)

        # Écraser l’image traitée dans S3
        s3.put_object(Bucket=bucket, Key=key, Body=buffer, ContentType='image/jpeg')
        print(f"✅ Image traitée et sauvegardée : {key}")

    except Exception as e:
        print(f"❌ Erreur traitement image ({key}):", str(e))

def analyze_and_save(bucket, key, user_id=None, album_id=None, description=None, location=None, cors=False):
    response = rekognition.detect_labels(
        Image={'S3Object': {'Bucket': bucket, 'Name': key}},
        MaxLabels=10,
        MinConfidence=80
    )

    labels = [label['Name'] for label in response['Labels']]

    item = {
        'photo': key,
        'labels': labels,
        'uploadedAt': datetime.utcnow().isoformat()
    }
    if user_id:
        item['userId'] = user_id
    if album_id:
        item['albumId'] = album_id
    if description:
        item['description'] = description
    if location:
        item['location'] = location

    table.put_item(Item=item)

    result = {
        'statusCode': 200,
        'body': json.dumps({'message': 'Analyse réussie.', 'labels': labels})
    }
    if cors:
        result['headers'] = default_cors()
    return result

def default_cors():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
