from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import List, Literal
import openai
import os

# 🔐 Charger la clé API
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

# 🌐 Activer CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # à restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📦 Schémas Pydantic
class ChatMessage(BaseModel):
    role: Literal["user", "bot"]
    text: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

# 💬 Réponses personnalisées (intelligence locale)
def check_custom_reply(user_input: str):
    user_input = user_input.lower()

    if "photos favorites" in user_input or "favoris" in user_input:
        return "❤️ Voici le lien vers tes photos favorites : http://localhost:3000/favorites"

    if "albums" in user_input and "créés" in user_input:
        return "📁 Tu as déjà créé des albums comme : Vacances, Famille, Amis. Tu peux en créer d'autres dans la page d'accueil."
     
    if "comment créer un album" in user_input or "ajouter un album" in user_input:
        return "📝 Pour créer un album, clique sur le bouton 'Créer un album' dans la barre de navigation et entre un nom."

    if "comment uploader" in user_input or "ajouter une photo" in user_input:
        return "📤 Clique sur le bouton 'Uploader une photo', choisis une image, ajoute une description et un lieu, puis clique sur Envoyer."

    if "analyse" in user_input or "intelligence artificielle" in user_input:
        return "🤖 Nous utilisons Amazon Rekognition pour analyser tes images et générer automatiquement des labels intelligents."

    if "description" in user_input:
        return "🗒️ Tu peux ajouter une description à chaque image lors de l’upload pour mieux les retrouver ensuite."

    if "localisation" in user_input or "lieu" in user_input:
        return "📍 Lors de l'upload, tu peux ajouter un lieu (ville ou coordonnées GPS) pour chaque photo."

    if "changer ma photo de profil" in user_input:
        return "👤 Va dans ton profil pour changer ta photo de profil. Clique sur l'image actuelle pour en sélectionner une nouvelle."

    if "comment supprimer une photo" in user_input:
        return "🗑️ Dans la galerie, clique sur l’icône de corbeille sous la photo que tu veux supprimer."

    if "mode sombre" in user_input:
        return "🌙 Active le mode sombre en cliquant sur l’icône de lune en haut à droite de la page."

    if "déconnexion" in user_input or "logout" in user_input:
        return "🚪 Tu peux te déconnecter depuis le menu utilisateur dans la barre de navigation."

    return None  # Aucun match personnalisé

# 🔁 Route principale
@app.post("/chatbot")
async def chatbot(request: ChatRequest):
    messages = request.messages
    if not messages:
        raise HTTPException(status_code=400, detail="Aucun message fourni.")

    # ✅ Dernier message de l'utilisateur
    last_input = messages[-1].text
    custom_reply = check_custom_reply(last_input)

    if custom_reply:
        return {"reply": custom_reply}

    # 💬 Préparer historique pour GPT
    formatted = [
        {"role": "user" if m.role == "user" else "assistant", "content": m.text}
        for m in messages
    ]

    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=formatted,
            max_tokens=1000,
        )
        reply = response.choices[0].message.content.strip()
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur GPT : {str(e)}")
