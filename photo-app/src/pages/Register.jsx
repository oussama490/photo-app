import React, { useState } from "react";
import {
  CognitoUserAttribute,
  CognitoUser,
} from "amazon-cognito-identity-js";
import UserPool from "../aws/cognitoConfig";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import ParticlesBackground from "../components/ParticlesBackground";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = () => {
    if (password !== confirmPassword) {
      setMessage("❌ Les mots de passe ne correspondent pas.");
      setSuccess(false);
      return;
    }

    setLoading(true);
    const attributes = [new CognitoUserAttribute({ Name: "email", Value: email })];

    UserPool.signUp(email, password, attributes, null, (err, result) => {
      setLoading(false);
      if (err) {
        setMessage("❌ " + err.message);
        setSuccess(false);
      } else {
        setMessage("📩 Un code a été envoyé à votre email.");
        setSuccess(true);
        setStep(2);
      }
    });
  };

  const handleConfirm = () => {
    setLoading(true);
    const cognitoUser = new CognitoUser({ Username: email, Pool: UserPool });

    cognitoUser.confirmRegistration(code, true, (err) => {
      setLoading(false);
      if (err) {
        setMessage("❌ Code invalide : " + err.message);
        setSuccess(false);
      } else {
        setMessage("✅ Email vérifié avec succès !");
        setSuccess(true);
        setStep(3);
      }
    });
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getPasswordStrength();
  const strengthColors = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  const strengthText = ["Très faible", "Faible", "Moyen", "Fort"];

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 flex items-center justify-center p-4 overflow-hidden">
        {/* ✅ Particles animation */}
        <ParticlesBackground />

        <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl p-8 w-full max-w-md z-10">
          <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text mb-6">
            📝 Créer un compte
          </h2>

          {message && (
            <motion.div
              className={`flex items-center gap-2 px-4 py-2 mb-4 rounded-lg text-sm font-medium ${
                success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {success ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />}
              <span>{message}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3 }}
              >
                <input
                  type="email"
                  placeholder="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mb-4 p-3 border border-gray-300 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mb-2 p-3 border border-gray-300 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <input
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full mb-4 p-3 border border-gray-300 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />

                <div className="w-full h-2 rounded-full mb-4 bg-gray-200">
                  <div
                    className={`h-full ${strengthColors[strength - 1] || "bg-gray-300"} rounded-full`}
                    style={{ width: `${(strength / 4) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-center text-gray-600 mb-4">
                  Force du mot de passe : <strong>{strengthText[strength - 1] || "Faible"}</strong>
                </p>

                <div className="mb-4 text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    {password.length >= 8 ? <FaCheckCircle className="text-green-600" /> : <FaTimesCircle className="text-red-500" />}
                    <span>Au moins 8 caractères</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/[A-Z]/.test(password) ? <FaCheckCircle className="text-green-600" /> : <FaTimesCircle className="text-red-500" />}
                    <span>1 lettre majuscule</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/[0-9]/.test(password) ? <FaCheckCircle className="text-green-600" /> : <FaTimesCircle className="text-red-500" />}
                    <span>1 chiffre</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/[^A-Za-z0-9]/.test(password) ? <FaCheckCircle className="text-green-600" /> : <FaTimesCircle className="text-red-500" />}
                    <span>1 caractère spécial</span>
                  </div>
                </div>

                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? "⏳ En cours..." : "S’inscrire"}
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3 }}
              >
                <p className="mb-3 text-sm text-gray-600">
                  🔐 Entrez le code de confirmation envoyé à <strong>{email}</strong>
                </p>
                <input
                  type="text"
                  placeholder="Code de confirmation"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full mb-6 p-3 border border-purple-300 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {loading ? "⏳ Vérification..." : "Confirmer le compte"}
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3 }}
                className="text-center text-green-700 font-semibold text-lg"
              >
                🎉 Compte confirmé !{" "}
                <Link to="/login" className="text-purple-600 hover:underline font-bold">
                  Connectez-vous ici
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-6 text-center text-sm text-gray-600">
            Vous avez déjà un compte ?{" "}
            <Link to="/login" className="text-purple-600 hover:underline font-semibold">
              Connexion
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
