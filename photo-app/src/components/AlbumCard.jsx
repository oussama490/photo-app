import React from "react";

export default function AlbumCard({ album, onSelect }) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 w-full sm:w-auto">
      <div className="font-semibold dark:text-white">{album.name}</div>
      <button
        onClick={() => onSelect(album.albumId)}
        className="text-green-600 hover:underline mt-2 text-sm"
      >
        📷 Voir les photos
      </button>
    </div>
  );
}
