import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AlbumSlider from "../components/AlbumSlider";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

import PhotoCard from "../components/PhotoCard";
import AlbumsSlider from "../components/AlbumsSlider";
import UploadForm from "../components/UploadForm";
import { motion, AnimatePresence } from "framer-motion";
import {
  generateUploadUrl,
  analyzePhoto,
  getLabels,
  listPhotos,
  createAlbum,
  listAlbums,
  deletePhoto,
  toggleFavorite,
  deleteAlbum,
} from "../utils/api";

export default function Home() {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showCreateAlbumForm, setShowCreateAlbumForm] = useState(false);

  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [file, setFile] = useState(null);
  const [albumName, setAlbumName] = useState("");
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [notification, setNotification] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteAlbum, setConfirmDeleteAlbum] = useState(null);
  const [uploading, setUploading] = useState(false);

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
      fetchAlbums(storedToken);
      fetchPhotos(storedToken);
    }
  }, [navigate]);

  const showNotification = (message, success = true) => {
    setNotification({ message, success });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchAlbums = async (token) => {
    try {
      const res = await listAlbums(token);
      setAlbums(res.albums);
    } catch (err) {
      console.error("Erreur chargement albums:", err);
    }
  };

  const fetchPhotos = async (token, albumId = null) => {
    try {
      const res = await listPhotos(token, albumId);
      const sorted = res.sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
      setPhotos(sorted);
    } catch (err) {
      console.error("Erreur chargement photos:", err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return showNotification("📌 Veuillez choisir une image.", false);
    try {
      setUploading(true);
      const { upload_url, photo_key, download_url } = await generateUploadUrl(token, file.name, selectedAlbumId || null);
      await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      await analyzePhoto(token, photo_key, selectedAlbumId || null, description, location);
      setTimeout(async () => {
        const result = await getLabels(token, photo_key);
        const newPhoto = {
          photo: photo_key,
          labels: result.labels,
          albumId: selectedAlbumId || null,
          description,
          location,
          uploadedAt: new Date().toISOString(),
          download_url,
          isFavorite: false,
        };
        setPhotos((prev) => [newPhoto, ...prev]);
        setFile(null);
        setDescription("");
        setLocation("");
        showNotification("✅ Photo uploadée et analysée !");
      }, 2000);
    } catch (err) {
      console.error(err);
      showNotification("❌ Erreur durant l'upload ou l'analyse.", false);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateAlbum = async () => {
    if (!albumName.trim()) return showNotification("📁 Entrez un nom d’album.", false);
    try {
      const res = await createAlbum(token, albumName.trim());
      setAlbums((prev) => [...prev, { name: albumName.trim(), albumId: res.albumId }]);
      setAlbumName("");
      showNotification(`✅ Album "${albumName}" créé avec succès !`);
    } catch (err) {
      console.error(err);
      showNotification("❌ Erreur création album.", false);
    }
  };

  const handleFilterByAlbum = async (albumId) => {
    setSelectedAlbumId(albumId || "");
    await fetchPhotos(token, albumId);
  };

  const confirmDeletePhoto = (photoKey) => setConfirmDelete(photoKey);

  const handleDeleteConfirmed = async () => {
    try {
      await deletePhoto(token, confirmDelete);
      setPhotos((prev) => prev.filter((p) => p.photo !== confirmDelete));
      showNotification("✅ Photo supprimée !");
    } catch (err) {
      console.error("Erreur suppression photo:", err);
      showNotification("❌ Erreur lors de la suppression.", false);
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleDeleteAlbum = (albumId) => {
    const hasPhotos = photos.some((p) => p.albumId === albumId);
    if (hasPhotos) return showNotification("❌ Impossible de supprimer un album contenant des photos.", false);
    setConfirmDeleteAlbum(albumId);
  };

  const handleDeleteAlbumConfirmed = async (albumId) => {
    try {
      await deleteAlbum(token, albumId);
      setAlbums((prev) => prev.filter((a) => a.albumId !== albumId));
      showNotification("🗂️ Album supprimé !");
    } catch (err) {
      console.error(err);
      showNotification("❌ Erreur suppression album", false);
    } finally {
      setConfirmDeleteAlbum(null);
    }
  };

  const handleToggleFavorite = async (photo) => {
    try {
      await toggleFavorite(token, photo.photo, photo.isFavorite);
      setPhotos((prev) =>
        prev.map((p) => (p.photo === photo.photo ? { ...p, isFavorite: !photo.isFavorite } : p))
      );
    } catch (err) {
      console.error("Erreur favori:", err);
      showNotification("❌ Impossible de changer le statut favori.", false);
    }
  };

  const filteredPhotos = photos.filter((photo) => {
    const term = searchTerm.toLowerCase();
    return (
      photo.labels?.some((label) => label.toLowerCase().includes(term)) ||
      photo.description?.toLowerCase().includes(term)
    );
  });

  const groupedByDate = filteredPhotos.reduce((acc, photo) => {
    const dateKey = new Date(photo.uploadedAt).toLocaleDateString("fr-CA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(photo);
    return acc;
  }, {});

  const favoriteAlbums = albums.filter((album) =>
    photos.some((photo) => photo.albumId === album.albumId && photo.isFavorite)
  );

  return (
    <>
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenUploadForm={() => setShowUploadForm(true)}
        onOpenCreateAlbumForm={() => setShowCreateAlbumForm(true)}
      />
      <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 px-4 py-10 dark:from-indigo-900 dark:via-purple-900 dark:to-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-center mb-10 text-pink-600 dark:text-pink-300 tracking-tight"
          >
            📸 Ma Galerie Créative
          </motion.h1>

          <AlbumsSlider
            albums={albums}
            onSelect={handleFilterByAlbum}
            onDelete={handleDeleteAlbum}
          />

          {selectedAlbumId && photos.length > 0 && (
  <div className="mb-10">
    <h2 className="text-lg font-semibold text-pink-700 dark:text-pink-300 mb-4">
      📸 Photos de l’album
    </h2>
    <Swiper
      spaceBetween={20}
      slidesPerView={"auto"}
      navigation
      modules={[Navigation]}
      className="pb-4"
    >
      {photos.map((photo, index) => (
       <SwiperSlide key={index} style={{ width: "200px" }}>
  <PhotoProvider>
    <PhotoView src={photo.download_url}>
      <img
        src={photo.download_url}
        alt={`photo-${index}`}
        className="h-48 w-48 object-cover rounded-xl shadow-lg transition hover:scale-105 cursor-pointer"
      />
    </PhotoView>
  </PhotoProvider>
</SwiperSlide>

      ))}
    </Swiper>
  </div>
)}


         

{/* 📤 Formulaire d’upload de photo (à droite avec animation) */}
<AnimatePresence>
  {showUploadForm && (
    <motion.div
      key="upload-form"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="fixed top-16 right-6 w-[460px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white rounded-2xl shadow-2xl p-6 z-50 border border-pink-500 scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-transparent"
    >
      {/* Titre + bouton fermer */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-pink-400">📤 Uploader une photo</h2>
        <button
          onClick={() => setShowUploadForm(false)}
          className="text-pink-300 hover:text-pink-500 text-2xl"
        >
          ❌
        </button>
      </div>

      {/* Formulaire complet */}
      <UploadForm
        file={file}
        setFile={setFile}
        albums={albums}
        selectedAlbumId={selectedAlbumId}
        setSelectedAlbumId={setSelectedAlbumId}
        description={description}
        setDescription={setDescription}
        location={location}
        setLocation={setLocation}
        handleUpload={handleUpload}
        uploading={uploading}
      />
    </motion.div>
  )}
</AnimatePresence>



{/*  Formulaire de création d’album (à gauche avec animation) */}
<AnimatePresence>
  {showCreateAlbumForm && (
  <motion.div
    key="create-album-form"
    initial={{ x: -300, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -300, opacity: 0 }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
    className="fixed top-24 left-4 w-[400px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 z-50 border border-purple-300 dark:border-purple-500 animate-fade-in"
  >
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
        📁 Créer un nouvel album
      </h2>
      <button
        onClick={() => setShowCreateAlbumForm(false)}
        className="text-gray-500 hover:text-red-500 text-xl transition-all duration-200"
        title="Fermer"
      >
        ❌
      </button>
    </div>

    <div className="flex gap-3 items-center">
      <input
        id="albumName"
        type="text"
        value={albumName}
        onChange={(e) => setAlbumName(e.target.value)}
        placeholder="Nom de l’album"
        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-pink-400 dark:bg-gray-700 dark:text-white transition duration-300 focus:shadow-[0_0_10px_rgba(236,72,153,0.5)]"
      />
      <button
        onClick={handleCreateAlbum}
        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-5 py-2 rounded-lg shadow-md hover:from-pink-600 hover:to-purple-600 transition-all duration-300 flex items-center gap-2"
      >
        <span className="animate-pulse">📁</span> Créer
      </button>
    </div>
  </motion.div>
)}

</AnimatePresence>


          <div className="mb-6 mt-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Rechercher par tags ou description"
              className="w-full p-3 rounded-xl border shadow-sm focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {Object.entries(groupedByDate).map(([date, photos]) => (
            <section key={date} className="mb-10">
              <h2 className="text-xl font-bold text-purple-600 dark:text-purple-300 mb-4">
                📅 {date.charAt(0).toUpperCase() + date.slice(1)}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {photos.map((photo, index) => (
                  <PhotoCard
                    key={index}
                    photo={photo}
                    onDelete={confirmDeletePhoto}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    {/*  Notification animée */}
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-xl text-sm font-semibold ${
            notification.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {notification.message}
        </motion.div>
      )}
    </AnimatePresence>

    {/*  Popup confirmation suppression de photo */}
    <AnimatePresence>
      {confirmDelete && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm"
          >
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              🗑️ Confirmer la suppression de la photo ?
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

    {/*  Popup confirmation suppression d’album */}
    <AnimatePresence>
      {confirmDeleteAlbum && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm"
          >
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              🗂️ Supprimer l’album ?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Cette action supprimera l’album de la liste. Assurez-vous qu’il ne contient plus de photos.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setConfirmDeleteAlbum(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteAlbumConfirmed(confirmDeleteAlbum)}
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
