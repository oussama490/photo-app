import React, { useState, useEffect, useRef } from "react";
import { askChatBot } from "../utils/api";
import { motion } from "framer-motion";

export default function ChatBot({ token }) {
  const chatRef = useRef(null);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Sauvegarde automatique à chaque mise à jour
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  // ✅ Message d’accueil seulement si aucune sauvegarde
  useEffect(() => {
    if (token && messages.length === 0) {
      const welcome = async () => {
        setLoading(true);
        try {
          const res = await askChatBot(
            "Bonjour ! Je suis un assistant numérique et je suis ici pour répondre à tes questions. Que puis-je faire pour toi aujourd’hui ?",
            token,
            []
          );
          setMessages([{ role: "bot", text: res }]);
        } catch (err) {
          console.error("Erreur chatbot :", err);
          setMessages([
            { role: "bot", text: "❌ Le chatbot est momentanément indisponible." },
          ]);
        } finally {
          setLoading(false);
        }
      };
      welcome();
    }
  }, [token]); // pas de [messages] ici pour éviter la boucle infinie

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { role: "user", text: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setLoading(true);

    try {
      const response = await askChatBot(userInput, token, newMessages.slice(-10));
      setMessages([...newMessages, { role: "bot", text: response }]);
    } catch (err) {
      console.error("Erreur chatbot :", err);
      setMessages([
        ...newMessages,
        { role: "bot", text: "❌ Une erreur est survenue. Réessaie plus tard." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-3">
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-800 rounded-lg p-2 space-y-2"
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 text-sm rounded-2xl shadow ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div
            key="typing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            Assistant en cours...
          </motion.div>
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 px-3 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
          placeholder="Pose ta question ici..."
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
        >
          {loading ? "..." : "Envoyer"}
        </button>
      </div>
    </div>
  );
}
