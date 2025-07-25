import React from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { Download, Trash2, Heart, HeartOff } from "lucide-react";

export default function PhotoCard({ photo, onDelete, onToggleFavorite }) {
  const formattedDate = new Date(photo.uploadedAt).toLocaleString("fr-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="relative backdrop-blur-md bg-white/60 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-xl transition hover:scale-[1.015] hover:shadow-indigo-300 dark:hover:shadow-indigo-700 duration-300">
      
      {/* Badge favori animé */}
      {photo.isFavorite && (
        <span className="absolute top-3 right-3 bg-indigo-500 text-white text-xs px-3 py-1 rounded-full shadow-md animate-bounce z-10">
          ❤️ Favori
        </span>
      )}

      {/* Image avec zoom + amélioration visuelle */}
      <PhotoProvider>
        <PhotoView src={photo.download_url}>
          <img
            src={photo.download_url}
            alt={photo.labels?.[0] || "Photo"}
            className="w-full h-64 object-cover cursor-pointer transition-transform duration-300 hover:scale-110 rounded-t-3xl"
            style={{ filter: "contrast(110%) brightness(105%)" }}
          />
        </PhotoView>
      </PhotoProvider>

      {/* Informations */}
      <div className="p-5 text-center dark:text-white">
        <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-1">
          📝 {photo.description || "—"}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-300 mb-1">
          📍 {photo.location || "Inconnue"}
        </p>
        <p className="text-xs text-gray-400 mb-3">📅 {formattedDate}</p>

        {/* Labels IA */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {photo.labels?.map((label, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full text-xs font-medium shadow-sm text-white bg-gradient-to-r from-violet-500 to-pink-500 dark:from-violet-700 dark:to-pink-600 hover:scale-105 transition-transform"
            >
              #{label}
            </span>
          ))}
        </div>

        {/* Boutons actions */}
        <div className="flex justify-center gap-3 mt-2">
          <a
            href={photo.download_url}
            download
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow transition"
            title="Télécharger"
          >
            <Download size={18} />
          </a>
          <button
            onClick={() => onDelete(photo.photo)}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow transition"
            title="Supprimer"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={() => onToggleFavorite(photo)}
            className={`p-2 rounded-full shadow transition ${
              photo.isFavorite
                ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                : "bg-gray-300 hover:bg-gray-400 text-black dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            }`}
            title="Favori"
          >
            {photo.isFavorite ? <HeartOff size={18} /> : <Heart size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
