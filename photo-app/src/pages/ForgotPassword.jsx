import React, { useState } from "react";
import { CognitoUser } from "amazon-cognito-identity-js";
import UserPool from "../aws/cognitoConfig";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import ParticlesBackground from "../components/ParticlesBackground";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: demander email, 2: saisir code et nouveau mdp
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = () => {
    const user = new CognitoUser({ Username: email, Pool: UserPool });
    user.forgotPassword({
      onSuccess: () => {
        setSuccess(true);
        setMessage("✅ Code envoyé à votre adresse email.");
        setStep(2);
      },
      onFailure: (err) => {
        setSuccess(false);
        setMessage("❌ " + (err.message || "Erreur lors de l'envoi du code."));
      },
    });
  };

  const handleResetPassword = () => {
    const user = new CognitoUser({ Username: email, Pool: UserPool });
    user.confirmPassword(code, newPassword, {
      onSuccess: () => {
        setSuccess(true);
        setMessage("✅ Mot de passe réinitialisé avec succès.");
        setTimeout(() => navigate("/login"), 2000);
      },
      onFailure: (err) => {
        setSuccess(false);
        setMessage("❌ " + (err.message || "Erreur lors du changement de mot de passe."));
      },
    });
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 flex items-center justify-center p-4 overflow-hidden">
        <ParticlesBackground />

        <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 w-full max-w-md z-10">
          <h2 className="text-2xl font-extrabold text-center mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🔑 Mot de passe oublié
          </h2>

          <AnimatePresence>
            {message && (
              <motion.div
                key="msg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center gap-2 px-4 py-2 mb-4 rounded-lg text-sm font-medium ${
                  success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {success ? <FaCheckCircle /> : <FaTimesCircle />}
                <span>{message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 ? (
            <>
              <input
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-4 p-3 border border-gray-300 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={handleSendCode}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl hover:opacity-90 transition"
              >
                📧 Envoyer le code de réinitialisation
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Code reçu par email"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full mb-4 p-3 border border-gray-300 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mb-4 p-3 border border-gray-300 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={handleResetPassword}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl hover:opacity-90 transition"
              >
                🔁 Changer le mot de passe
              </button>
            </>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            <Link to="/login" className="text-purple-600 hover:underline font-semibold">
              🔙 Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
