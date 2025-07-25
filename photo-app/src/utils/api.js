const API_BASE = "https://9z8jnzq2ni.execute-api.us-east-2.amazonaws.com/Prod";

// ✅ Créer un album
export async function createAlbum(token, name) {
  const response = await fetch(`${API_BASE}/albums`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) throw new Error("Erreur création album");
  return await response.json();
}

// ✅ Lister les albums
export async function listAlbums(token) {
  const response = await fetch(`${API_BASE}/albums`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Erreur chargement albums");
  const data = await response.json();
  return Array.isArray(data) ? { albums: data } : data;
}

// ✅ Supprimer un album
export async function deleteAlbum(token, albumId) {
  const response = await fetch(`${API_BASE}/albums/${albumId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Erreur suppression album");
  return await response.json();
}

// ✅ Générer une URL signée d’upload
export async function generateUploadUrl(token, fileName, albumId = null) {
  const query = new URLSearchParams();
  if (fileName) query.append("fileName", fileName);
  if (albumId) query.append("albumId", albumId);

  const response = await fetch(`${API_BASE}/upload-url?${query.toString()}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Erreur génération URL upload");
  return await response.json(); // { upload_url, photo_key, download_url }
}

// ✅ Analyser la photo (Rekognition)
export async function analyzePhoto(token, photoKey, albumId = null, description = "", location = "") {
  const body = { photo: photoKey };
  if (albumId) body.albumId = albumId;
  if (description) body.description = description;
  if (location) body.location = location;

  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error("Erreur analyse image");
  return await response.json();
}

// ✅ Obtenir les labels Rekognition
export async function getLabels(token, photoKey) {
  const fullKey = photoKey.startsWith("photo/") ? photoKey : `photo/${photoKey}`;
  const response = await fetch(`${API_BASE}/labels?photo=${encodeURIComponent(fullKey)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Erreur récupération labels");
  return await response.json();
}

// ✅ Lister les photos
export async function listPhotos(token, albumId = null) {
  let url = `${API_BASE}/photos`;
  if (albumId) url += `?albumId=${encodeURIComponent(albumId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Erreur chargement photos");
  const data = await response.json();

  return data.map((photo) => ({
    photo: photo.photo,
    labels: photo.labels || [],
    albumId: photo.albumId || null,
    description: photo.description || "",
    location: photo.location || "",
    uploadedAt: photo.uploadedAt || null,
    download_url: photo.download_url || null,
    isFavorite: photo.isFavorite || false,
  }));
}

// ✅ Supprimer une photo
export async function deletePhoto(token, photoKey) {
  const fullKey = photoKey.startsWith("photo/") ? photoKey : `photo/${photoKey}`;
  const response = await fetch(`${API_BASE}/photos`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ photo: fullKey }),
  });

  if (!response.ok) throw new Error("Erreur suppression photo");
  return await response.json();
}

// ✅ Marquer/démarquer en favori
export async function toggleFavorite(token, photoKey, currentStatus) {
  const fullKey = photoKey.startsWith("photo/") ? photoKey : `photo/${photoKey}`;
  const response = await fetch(`${API_BASE}/favorite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      photo: fullKey,
      isFavorite: !currentStatus,
    }),
  });

  if (!response.ok) throw new Error("Erreur changement favori");
  return await response.json(); // { isFavorite: true/false }
}

// ✅ Obtenir l'URL de la photo de profil
export async function getProfilePhoto(token) {
  const response = await fetch(`${API_BASE}/get-profile-photo`, {
    method: "GET",
    headers: {
      Authorization: token, // Pas de Bearer ici (personnalisée)
    },
  });

  if (!response.ok) throw new Error("Erreur récupération photo de profil");
  const data = await response.json();
  return data.url;
}

// ✅ Uploader la photo de profil (base64)
export async function uploadProfilePhoto(token, file) {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        const base64 = reader.result.split(",")[1]; // Supprime le préfixe
        const response = await fetch(`${API_BASE}/upload-profile-photo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ base64 }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error("Erreur Upload:", errText);
          throw new Error("Échec de l’upload de la photo de profil");
        }

        resolve();
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsDataURL(file); // Lit l'image en base64
  });
} 
export async function askChatBot(userInput, token, contextMessages = []) {
  const allMessages = [...contextMessages, { role: "user", text: userInput }];

  const response = await fetch("http://localhost:8001/chatbot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages: allMessages }),
  });

  const data = await response.json();
  return data.reply;
}
