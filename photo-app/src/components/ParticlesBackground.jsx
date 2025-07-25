// src/components/ParticlesBackground.jsx
import React from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function ParticlesBackground() {
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <Particles
      init={particlesInit}
      className="absolute inset-0 z-0"
      options={{
        fullScreen: false,
        background: { color: "transparent" },
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: { enable: true, mode: "repulse" },
            resize: true,
          },
          modes: {
            repulse: { distance: 80, duration: 0.4 },
          },
        },
        particles: {
          color: { value: ["#34d399", "#60a5fa"] }, // vert & bleu
          links: { enable: true, color: "#a5f3fc", distance: 120, opacity: 0.5 },
          move: { enable: true, speed: 2 },
          number: { value: 60, density: { enable: true, area: 800 } },
          opacity: { value: 0.6 },
          shape: { type: "circle" },
          size: { value: 3 },
        },
      }}
    />
  );
}
