import React from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PhotoSlider({ photos }) {
  const sliderRef = React.useRef();

  const scroll = (dir) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
    }
  };

  return (
    <div className="relative my-10">
      <h2 className="text-xl font-bold text-pink-600 dark:text-pink-300 mb-4 px-2">✨ Photos en vedette</h2>
      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 p-2 rounded-full shadow hover:bg-gray-200"
        >
          <ChevronLeft />
        </button>
        <div
          ref={sliderRef}
          className="flex overflow-x-auto gap-4 px-8 py-2 scrollbar-hide"
        >
          {photos.map((photo, i) => (
            <PhotoProvider key={i}>
              <PhotoView src={photo.download_url}>
                <img
                  src={photo.download_url}
                  alt={`photo-${i}`}
                  className="w-36 h-36 object-cover rounded-2xl shadow-md hover:scale-105 transition-transform cursor-pointer"
                />
              </PhotoView>
            </PhotoProvider>
          ))}
        </div>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 p-2 rounded-full shadow hover:bg-gray-200"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
