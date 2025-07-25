import boto3
import os
import json

# Initialiser DynamoDB
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

def lambda_handler(event, context):
    print("🔍 Event reçu :", json.dumps(event))

    # Récupération du paramètre `photo` depuis l'URL
    params = event.get("queryStringParameters", {})
    photo_key = params.get("photo") if params else None  # ✅ clé correcte

    if not photo_key:
        return {
            'statusCode': 400,
            'headers': cors_headers(),
            'body': json.dumps({'message': 'Le paramètre "photo" est requis.'})
        }

    try:
        # Lecture dans DynamoDB avec clé primaire "photo"
        response = table.get_item(Key={'photo': photo_key})
        
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': cors_headers(),
                'body': json.dumps({'message': 'Photo non trouvée.'})
            }

        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps(response['Item'])  # ✅ retourne l'objet complet (clé + labels)
        }

    except Exception as e:
        print("❌ Erreur:", str(e))
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'message': f"Erreur interne : {str(e)}"})
        }

# Fonction pour les headers CORS
def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
