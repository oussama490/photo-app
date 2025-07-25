import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({
  darkMode,
  onToggleDarkMode,
  onOpenUploadForm,
  onOpenCreateAlbumForm,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");
  const [profileUrl, setProfileUrl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowNavbar(currentScrollY < lastScrollY.current || currentScrollY < 100);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const profileImage = localStorage.getItem("profileImage");
    if (isLoggedIn && profileImage) {
      setProfileUrl(profileImage);
    }
  }, [isLoggedIn, localStorage.getItem("profileImage")]);

  useEffect(() => {
    const closeMenu = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <AnimatePresence>
      {showNavbar && (
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-50"
        >
          <Link
            to="/"
            className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent tracking-tight"
          >
            📸 PhotoApp
          </Link>

          <div className="flex items-center gap-4 text-sm font-medium">
            {isLoggedIn ? (
              <>
                <button
                  onClick={onOpenUploadForm}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full shadow hover:scale-105 transition-all duration-300"
                >
                  📷 Ajouter une photo
                </button>

                <button
                  onClick={onOpenCreateAlbumForm}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white px-4 py-2 rounded-full shadow hover:scale-105 transition-all duration-300"
                >
                  📁 Créer un album
                </button>

                <Link
                  to="/home"
                  className="text-gray-800 dark:text-white hover:text-blue-600 transition"
                >
                  🏠 Accueil
                </Link>

                <Link
                  to="/favorites"
                  className="text-red-500 dark:text-red-400 hover:underline transition"
                >
                  ❤️ Favoris
                </Link>

                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <img
                      src={
                        profileUrl?.startsWith("http")
                          ? profileUrl
                          : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt="Profil"
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                    />
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-white" />
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50"
                      >
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          👤 Mon Profil
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                        >
                          🚪 Déconnexion
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                {location.pathname !== "/register" && (
                  <Link to="/register" className="text-gray-800 dark:text-white hover:underline">
                    📝 Inscription
                  </Link>
                )}
                {location.pathname !== "/login" && (
                  <Link to="/login" className="text-gray-800 dark:text-white hover:underline">
                    🔐 Connexion
                  </Link>
                )}
              </>
            )}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
