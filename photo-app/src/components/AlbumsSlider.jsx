import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Trash2 } from "lucide-react"; // npm install lucide-react

export default function AlbumsSlider({ albums, onSelect, onDelete }) {
  return (
    <div className="mb-10">
      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 dark:from-pink-400 dark:to-purple-500 mb-6">
        🎠 Vos Albums
      </h2>

      <Swiper
        spaceBetween={16}
        slidesPerView="auto"
        navigation
        modules={[Navigation]}
        className="pb-4"
      >
        {/* Slide pour tous les albums */}
        <SwiperSlide style={{ width: "auto" }}>
          <button
            onClick={() => onSelect(null)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow transition whitespace-nowrap"
          >
            📂 Tous les albums
          </button>
        </SwiperSlide>

        {/* Slides des albums */}
        {albums.map((album) => (
          <SwiperSlide key={album.albumId} style={{ width: "auto" }}>
            <div className="relative group flex items-center gap-2">
              <button
                onClick={() => onSelect(album.albumId)}
                className="bg-gradient-to-br from-purple-300 to-pink-300 dark:from-purple-800 dark:to-pink-700 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-md hover:scale-105 hover:shadow-lg transition cursor-pointer whitespace-nowrap"
              >
                📸 {album.name}
              </button>
              <button
                onClick={() => onDelete(album.albumId)}
                className="opacity-0 group-hover:opacity-100 transition text-red-600 hover:text-red-800"
                title="Supprimer l’album"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
