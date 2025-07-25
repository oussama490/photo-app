import React, { useRef } from "react";
import {
  FaImage,
  FaMapMarkerAlt,
  FaStickyNote,
  FaFolderOpen,
  FaCloudUploadAlt,
  FaTrashAlt,
} from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import imageCompression from "browser-image-compression";

export default function UploadForm({
  file,
  setFile,
  albums,
  selectedAlbumId,
  setSelectedAlbumId,
  description,
  setDescription,
  location,
  setLocation,
  handleUpload,
  uploading,
}) {
  const fileInputRef = useRef();

  const handleFileChange = async (e) => {
    const image = e.target.files[0];
    if (!image) return;

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(image, options);
      setFile(compressedFile);
    } catch (err) {
      console.error("Erreur compression image :", err);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const image = e.dataTransfer.files[0];
    if (!image) return;
    await handleFileChange({ target: { files: [image] } });
  };

  const handleReset = () => {
    setFile(null);
    fileInputRef.current.value = "";
  };

  return (
    <form
      onSubmit={handleUpload}
      className="max-w-2xl mx-auto bg-white/80 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 backdrop-blur-lg shadow-xl rounded-3xl p-8 space-y-6 transition duration-300"
    >
      <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 dark:from-pink-400 dark:to-purple-500">
        📤 Ajouter une nouvelle photo
      </h2>

      {/* Zone de sélection image customisée */}
      <div
        className="flex flex-col items-center justify-center text-center border-2 border-dashed border-pink-400 dark:border-pink-600 rounded-xl p-6 cursor-pointer hover:bg-pink-50 dark:hover:bg-gray-800 transition relative"
        onClick={() => fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {file ? (
          <>
            <img
              src={URL.createObjectURL(file)}
              alt="Aperçu"
              className="rounded-xl max-h-64 object-contain shadow-md"
            />
            <button
              type="button"
              onClick={handleReset}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition"
            >
              <FaTrashAlt />
            </button>
          </>
        ) : (
          <>
            <FaImage className="text-5xl text-pink-500 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Cliquez ou glissez une image ici
            </p>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
      </div>

      {/* Album */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
          <FaFolderOpen className="inline mr-2 text-purple-500" />
          Album
        </label>
        <select
          value={selectedAlbumId}
          onChange={(e) => setSelectedAlbumId(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
        >
          <option value="">Aucun</option>
          {albums.map((album) => (
            <option key={album.albumId} value={album.albumId}>
              {album.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
          <FaStickyNote className="inline mr-2 text-pink-400" />
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex : Portrait, plage, souvenir..."
          className="w-full px-4 py-3 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
        />
      </div>

      {/* Localisation */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
          <FaMapMarkerAlt className="inline mr-2 text-indigo-500" />
          Localisation
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ex : Paris, Tokyo ou coordonnées GPS"
          className="w-full px-4 py-3 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
      </div>

      {/* Upload Button */}
      <button
        type="submit"
        disabled={uploading}
        className={`w-full flex items-center justify-center gap-2 ${
          uploading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        } text-white font-semibold py-3 px-6 rounded-xl text-lg shadow-lg transition`}
      >
        {uploading ? (
          <>
            <ImSpinner2 className="animate-spin text-xl" />
            Chargement...
          </>
        ) : (
          <>
            <FaCloudUploadAlt className="text-xl" />
            Lancer l’upload
          </>
        )}
      </button>
    </form>
  );
}
