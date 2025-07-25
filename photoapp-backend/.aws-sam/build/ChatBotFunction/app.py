import json
import boto3

def lambda_handler(event, context):
    try:
        print("EVENT:", event)

        if "body" not in event:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Requête invalide. Le champ 'body' est manquant."})
            }

        body = json.loads(event["body"])
        user_message = body.get("message", "")

        if not user_message:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Aucun message fourni."})
            }

        # Initialisation du client Bedrock
        client = boto3.client("bedrock-runtime", region_name="us-east-2")

        # Utiliser Claude 3 Haiku
        model_id = "anthropic.claude-3-haiku-20240307-v1:0"

        # Préparer la requête
        payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "messages": [
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            "max_tokens": 1000
        }

        response = client.invoke_model(
            modelId=model_id,
            body=json.dumps(payload),
            contentType="application/json",
            accept="application/json"
        )

        response_body = json.loads(response["body"].read())
        print("RESPONSE BODY:", response_body)

        ai_reply = response_body.get("content", [{}])[0].get("text", "Le chatbot n'a pas répondu.")

        return {
            "statusCode": 200,
            "body": json.dumps({"response": ai_reply})
        }

    except Exception as e:
        print("ERREUR :", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Erreur interne : " + str(e)})
        }
