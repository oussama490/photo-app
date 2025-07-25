import React, { useState } from "react";
import {
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import UserPool from "../aws/cognitoConfig";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import ParticlesBackground from "../components/ParticlesBackground";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setLoading(true);
    setMessage(null);

    const user = new CognitoUser({ Username: email, Pool: UserPool });
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        const idToken = session.getIdToken().getJwtToken();
        localStorage.setItem("token", idToken);
        setSuccess(true);
        setMessage("✅ Connexion réussie !");
        setTimeout(() => navigate("/home"), 1500);
      },
      onFailure: (err) => {
        setSuccess(false);
        setMessage("❌ " + (err.message || "Erreur de connexion."));
        setLoading(false);
      },
    });
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 flex items-center justify-center p-4 overflow-hidden">
        <ParticlesBackground />

        <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 w-full max-w-md z-10">
          <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🔐 Connexion
          </h2>

          <AnimatePresence>
            {message && (
              <motion.div
                key="message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center gap-2 px-4 py-2 mb-4 rounded-lg text-sm font-medium ${
                  success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {success ? (
                  <FaCheckCircle className="text-green-500" />
                ) : (
                  <FaTimesCircle className="text-red-500" />
                )}
                <span>{message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 p-3 border border-gray-300 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <div className="relative mb-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* ✅ Lien vers mot de passe oublié */}
          <div className="text-right mb-6">
            <Link
              to="/forgot-password"
              className="text-sm text-purple-600 hover:underline font-medium"
            >
              🔓 Mot de passe oublié ?
            </Link>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "⏳ Connexion en cours..." : "Se connecter"}
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-purple-600 hover:underline font-semibold">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
