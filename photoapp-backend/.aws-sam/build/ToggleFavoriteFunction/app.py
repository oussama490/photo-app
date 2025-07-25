import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

def lambda_handler(event, context):
    try:
        # Authentification utilisateur via Cognito
        claims = event.get("requestContext", {}).get("authorizer", {}).get("claims", {})
        user_id = claims.get("sub")
        if not user_id:
            raise Exception("Utilisateur non authentifié")

        # Récupération du corps de la requête
        body = json.loads(event.get("body", "{}"))
        photo_key = body.get("photo")
        is_favorite = body.get("isFavorite")

        if not photo_key or is_favorite is None:
            return respond(400, {"message": "Champs 'photo' et 'isFavorite' requis"})

        # Mise à jour du champ isFavorite (et ajout userId s'il n'existe pas)
        table.update_item(
            Key={"photo": photo_key},
            UpdateExpression="SET isFavorite = :val, userId = if_not_exists(userId, :uid)",
            ExpressionAttributeValues={
                ":val": is_favorite,
                ":uid": user_id
            }
        )

        print(f"✅ Statut favori mis à jour pour {photo_key} : {is_favorite}")

        return respond(200, {
            "message": "Statut de favoris mis à jour",
            "isFavorite": is_favorite
        })

    except Exception as e:
        print("❌ Erreur Lambda toggle_favorite:", str(e))
        return respond(500, {"error": str(e)})

def respond(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "POST,OPTIONS"
        },
        "body": json.dumps(body)
    }
