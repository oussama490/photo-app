import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { getProfilePhoto, uploadProfilePhoto } from "../utils/api";
import { motion } from "framer-motion";

export default function Profile() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [userInfo, setUserInfo] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    try {
      const decoded = jwtDecode(token);
      setUserInfo({ email: decoded.email, sub: decoded.sub });
      getProfilePhoto(token)
        .then(setProfileImage)
        .catch((err) => console.error("Erreur récupération image profil:", err));
    } catch (err) {
      console.error("Token invalide", err);
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    darkMode
      ? document.documentElement.classList.add("dark")
      : document.documentElement.classList.remove("dark");
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const token = localStorage.getItem("token");
  try {
    setUploading(true);
    await uploadProfilePhoto(token, file);
    const url = await getProfilePhoto(token);
    setProfileImage(url);
    localStorage.setItem("profileImage", url); 
    window.location.reload(); // rechargement pour refléter l’image dans la Navbar
  } catch (err) {
    alert("Erreur lors de l’upload.");
    console.error(err);
  } finally {
    setUploading(false);
  }
};


  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <Navbar darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 dark:from-indigo-900 dark:via-purple-900 dark:to-gray-900 px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-8 w-full max-w-md text-center border border-gray-200 dark:border-gray-700"
        >
          <h1 className="text-3xl font-extrabold text-purple-600 dark:text-purple-300 mb-6">
            🌟 Mon Profil
          </h1>

          {userInfo ? (
            <div className="space-y-5 text-gray-700 dark:text-gray-200 text-lg">
              <div className="flex flex-col items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="profileUpload"
                />
                <label htmlFor="profileUpload" className="cursor-pointer">
                  <img
                    src={
                      profileImage?.startsWith("http")
                        ? profileImage
                        : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt="avatar"
                    className="w-28 h-28 rounded-full shadow-lg border-4 border-purple-500 hover:opacity-90 transition-all duration-200"
                  />
                </label>
                <small className="text-sm text-gray-500 dark:text-gray-400">
                  {uploading ? "📤 Upload en cours..." : "Cliquez sur l’image pour la modifier"}
                </small>
              </div>

              <p>
                <strong>📧 Email :</strong>{" "}
                <span className="text-purple-600 dark:text-purple-300">{userInfo.email}</span>
              </p>
              <p>
                <strong>🆔 ID Cognito :</strong>{" "}
                <span className="break-all text-gray-600 dark:text-gray-300">{userInfo.sub}</span>
              </p>

              <button
                onClick={handleLogout}
                className="mt-6 w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-3 rounded-xl shadow-lg transition-all duration-200"
              >
                🚪 Se déconnecter
              </button>
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-300">Chargement en cours...</p>
          )}
        </motion.div>
      </main>
    </>
  );
}
