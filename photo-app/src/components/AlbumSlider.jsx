import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

export default function AlbumSlider({ title, photos }) {
  if (!photos || photos.length === 0) return null;

  return (
    <div className="mb-10">
      <h3 className="text-xl font-bold text-pink-600 dark:text-pink-300 mb-3">
        📸 {title}
      </h3>
      <Swiper
        spaceBetween={12}
        slidesPerView="auto"
        navigation
        modules={[Navigation]}
        className="pb-2"
      >
        {photos.map((photo, index) => (
          <SwiperSlide key={index} style={{ width: "auto" }}>
            <PhotoProvider>
              <PhotoView src={photo.download_url}>
                <img
                  src={photo.download_url}
                  alt="photo"
                  className="w-32 h-32 rounded-xl object-cover shadow-md cursor-pointer hover:scale-105 transition"
                />
              </PhotoView>
            </PhotoProvider>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
