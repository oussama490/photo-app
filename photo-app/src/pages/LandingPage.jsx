// src/pages/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import Slider from "react-slick";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaMagic, FaHeart, FaMoon, FaImages } from "react-icons/fa";

export default function LandingPage() {
  const sliderImages = [
    "https://images.unsplash.com/photo-1549924231-f129b911e442",
    "https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
  ];

  const testimonials = [
    {
      name: "Sophie L.",
      comment: "PhotoApp m'a permis d'organiser mes souvenirs comme jamais auparavant !",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      name: "Marc D.",
      comment: "J'adore le design, l'IA est bluffante pour reconnaître les objets dans mes photos.",
      avatar: "https://randomuser.me/api/portraits/men/36.jpg"
    },
    {
      name: "Inès R.",
      comment: "Une galerie intelligente et magnifique. Je recommande à tous mes amis.",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  ];

  const stats = [
    { label: "Photos uploadées", value: "+12K" },
    { label: "Utilisateurs actifs", value: "+3.5K" },
    { label: "Albums créés", value: "+5K" },
  ];

  const features = [
    {
      icon: <FaMagic className="text-3xl text-pink-500 mb-4" />,
      title: "Analyse IA",
      desc: "Chaque photo est automatiquement taguée grâce à Amazon Rekognition."
    },
    {
      icon: <FaImages className="text-3xl text-indigo-500 mb-4" />,
      title: "Albums personnalisés",
      desc: "Organisez vos souvenirs en albums thématiques illimités."
    },
    {
      icon: <FaHeart className="text-3xl text-red-400 mb-4" />,
      title: "Favoris",
      desc: "Ajoutez vos clichés préférés à une galerie dédiée."
    },
    {
      icon: <FaMoon className="text-3xl text-purple-600 mb-4" />,
      title: "Mode sombre",
      desc: "Interface moderne et fluide, en clair comme en foncé."
    }
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000
  };

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 overflow-hidden">
      <Particles
        id="tsparticles"
        init={particlesInit}
        className="absolute inset-0 z-0"
        options={{
          fullScreen: false,
          background: { color: { value: "transparent" } },
          particles: {
            number: { value: 60, density: { enable: true, value_area: 800 } },
            color: { value: ["#f472b6", "#a78bfa"] },
            shape: { type: "circle" },
            opacity: { value: 0.4 },
            size: { value: 4 },
            move: { enable: true, speed: 1 }
          }
        }}
      />

      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="text-center px-6 py-20">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-extrabold text-indigo-700 dark:text-white mb-6"
          >
            📸 Organisez, analysez et partagez vos souvenirs
          </motion.h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            PhotoApp révolutionne votre façon de revivre vos souvenirs. Grâce à l'intelligence artificielle, chaque image est automatiquement analysée, catégorisée et rendue accessible en un instant. Que vous soyez photographe passionné, créateur de contenu ou parent souhaitant immortaliser chaque moment, PhotoApp est votre galerie intelligente de demain. Une solution élégante, performante et 100% sécurisée.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl shadow-lg font-semibold"
            >
              Commencer maintenant
            </Link>
            <Link
              to="/login"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl font-semibold"
            >
              J'ai déjà un compte
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-white to-purple-50 dark:from-gray-800 dark:to-gray-900">
          <h2 className="text-3xl font-bold text-center text-indigo-700 dark:text-indigo-300 mb-12">🚀 Nos fonctionnalités principales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-auto">
            {features.map((f, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow hover:shadow-lg"
              >
                {f.icon}
                <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{f.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white dark:bg-gray-800 py-10 px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="p-6 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-gray-700 dark:to-purple-800"
              >
                <h3 className="text-4xl font-bold text-pink-600 dark:text-pink-300">{stat.value}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-200 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Slider section */}
        <section className="max-w-4xl mx-auto px-6 mb-16">
          <h2 className="text-2xl font-bold text-center text-purple-700 dark:text-purple-300 mb-6">✨ Aperçu de la galerie</h2>
          <Slider {...settings}>
            {sliderImages.map((img, index) => (
              <div key={index} className="px-4">
                <img
                  src={`${img}?auto=format&fit=crop&w=1000&q=80`}
                  alt="slide"
                  className="rounded-2xl w-full h-72 object-cover shadow-lg"
                />
              </div>
            ))}
          </Slider>
        </section>

        {/* Testimonials */}
        <section className="bg-white dark:bg-gray-800 py-16 px-6">
          <h2 className="text-2xl font-bold text-center text-indigo-600 dark:text-indigo-300 mb-10">
            💬 Ce que disent nos utilisateurs
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((t, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-md"
              >
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-16 h-16 rounded-full mx-auto mb-4 shadow"
                />
                <p className="text-sm text-gray-600 dark:text-gray-300 italic mb-2">"{t.comment}"</p>
                <h4 className="font-semibold text-gray-800 dark:text-white">{t.name}</h4>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
          © {new Date().getFullYear()} PhotoApp • Créé avec ❤️ par O.H.M.H
        </footer>
      </div>
    </div>
  );
}
