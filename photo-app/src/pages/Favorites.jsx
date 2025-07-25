import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { listPhotos, toggleFavorite, deletePhoto } from "../utils/api";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownToLine, HeartOff, Trash2 } from "lucide-react";

export default function Favorites() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    darkMode
      ? document.documentElement.classList.add("dark")
      : document.documentElement.classList.remove("dark");
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) navigate("/login");
    else {
      setToken(storedToken);
      fetchFavoritePhotos(storedToken);
    }
  }, [navigate]);

  const showNotification = (message, success = true) => {
    setNotification({ message, success });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchFavoritePhotos = async (token) => {
    try {
      const allPhotos = await listPhotos(token);
      const favorites = allPhotos
        .filter((p) => p.isFavorite === true)
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      setPhotos(favorites);
    } catch (err) {
      console.error("Erreur chargement favoris:", err);
    }
  };

  const handleToggleFavorite = async (photo) => {
    try {
      await toggleFavorite(token, photo.photo, photo.isFavorite);
      setPhotos((prev) => prev.filter((p) => p.photo !== photo.photo));
      showNotification("💔 Retirée des favoris.");
    } catch (err) {
      console.error("Erreur favoris:", err);
    }
  };

  const requestDeletePhoto = (photoKey) => {
    setConfirmDelete(photoKey);
  };

  const handleDeleteConfirmed = async () => {
    try {
      await deletePhoto(token, confirmDelete);
      setPhotos((prev) => prev.filter((p) => p.photo !== confirmDelete));
      showNotification("✅ Photo supprimée !");
    } catch (err) {
      console.error("Erreur suppression:", err);
      showNotification("❌ Erreur lors de la suppression.", false);
    } finally {
      setConfirmDelete(null);
    }
  };

  const filteredPhotos = photos.filter((p) =>
    (p.description || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.labels || []).some((label) => label.toLowerCase().includes(search.toLowerCase()))
  );

  const groupedByDate = filteredPhotos.reduce((acc, photo) => {
    const date = new Date(photo.uploadedAt).toLocaleDateString("fr-CA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    acc[date] = acc[date] || [];
    acc[date].push(photo);
    return acc;
  }, {});

  return (
    <>
      <Navbar darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />
      <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-fuchsia-100 via-pink-100 to-purple-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-center text-pink-600 dark:text-pink-300 mb-10"
          >
            ❤️ Vos Photos Favorites
          </motion.h1>

          <input
            type="text"
            placeholder="🔍 Rechercher dans vos favoris"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md mx-auto block mb-8 px-5 py-3 rounded-full shadow border dark:bg-gray-900 dark:text-white"
          />

          {Object.entries(groupedByDate).length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-300">Aucune photo marquée en favori.</p>
          ) : (
            <PhotoProvider>
              {Object.entries(groupedByDate).map(([date, photosByDate], i) => (
                <div key={i} className="mb-12">
                  <div className="text-xl font-bold text-purple-600 dark:text-white mb-4">
                    📅 {date}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {photosByDate.map((photo, index) => (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={photo.photo}
                        className="relative group bg-gray-900 text-white rounded-2xl shadow-xl p-4"
                      >
                        <PhotoView src={photo.download_url || `https://oussama49.s3.us-east-2.amazonaws.com/${photo.photo}`}>
                          <img
                            src={photo.download_url || `https://oussama49.s3.us-east-2.amazonaws.com/${photo.photo}`}
                            alt={photo.description || "Photo favorite"}
                            className="w-full h-64 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
                          />
                        </PhotoView>

                        <div className="text-sm text-center mt-4 space-y-1">
                          <p>🖼️ {photo.description || "Pas de description"}</p>
                          <p>📍 {photo.location || "Lieu inconnu"}</p>
                          <p>📅 {date}</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 mt-3">
                          {photo.labels?.map((label, i) => (
                            <span
                              key={i}
                              className="bg-pink-600 text-white text-xs font-medium px-2 py-1 rounded-full"
                            >
                              #{label}
                            </span>
                          ))}
                        </div>

                        <div className="flex justify-center gap-4 mt-4">
                          <a
                            href={photo.download_url || `https://oussama49.s3.us-east-2.amazonaws.com/${photo.photo}`}
                            download
                            className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full shadow-lg"
                            title="Télécharger"
                          >
                            <ArrowDownToLine className="w-5 h-5 text-white" />
                          </a>
                          <button
                            onClick={() => requestDeletePhoto(photo.photo)}
                            className="bg-red-600 hover:bg-red-700 p-3 rounded-full shadow-lg"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5 text-white" />
                          </button>
                          <button
                            onClick={() => handleToggleFavorite(photo)}
                            className="bg-purple-600 hover:bg-purple-700 p-3 rounded-full shadow-lg"
                            title="Retirer des favoris"
                          >
                            <HeartOff className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </PhotoProvider>
          )}
        </div>
      </div>

      {/* 🔔 Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-xl text-sm font-semibold ${
              notification.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💬 Confirmation de suppression */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm"
            >
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                🗑️ Confirmer la suppression ?
              </h2>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
