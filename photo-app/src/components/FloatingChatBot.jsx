import React, { useEffect, useState } from "react";
import { BsRobot } from "react-icons/bs";
import ChatBot from "../pages/ChatBot";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingChatBot({ token }) {
  const [isOpen, setIsOpen] = useState(() => {
    return localStorage.getItem("chatbotOpen") === "true";
  });

  useEffect(() => {
    localStorage.setItem("chatbotOpen", isOpen.toString());
  }, [isOpen]);

  const toggleChat = () => setIsOpen(prev => !prev);

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-[9999] p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition"
        aria-label="Ouvrir le chatbot"
      >
        <BsRobot size={26} />
      </button>

      {/* Fenêtre du chatbot animée */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-24 right-6 z-[9998] w-[360px] h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border dark:border-gray-700"
          >
            <div className="bg-purple-600 text-white p-3 text-center font-semibold">
              🤖 PhotoBot Assistant
            </div>

            <div className="flex-1 overflow-y-auto">
              <ChatBot token={token} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
