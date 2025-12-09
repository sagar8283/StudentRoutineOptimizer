// components/MiniBarChart.js
import React from "react";
import { useSettings } from "./SettingsModal";

export default function MiniBarChart({ data = {} }) {
  // Access settings gracefully
  let settings = null;
  try {
    settings = useSettings().settings;
  } catch (e) {
    settings = null;
  }

  // Convert data to sorted arrays
  const labels = Object.keys(data).sort();
  const values = labels.map((k) => Number(data[k] || 0));
  const max = Math.max(...values, 1);

  return (
    <div className="relative w-full h-28 flex items-end gap-2 p-2 neon-chart-container">

      {/* If no data: show cyberpunk placeholder bars */}
      {labels.length === 0 &&
        Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 flex items-end"
          >
            <div
              className="w-full rounded-sm cyber-bar-placeholder"
              style={{ height: `${(i + 1) * 10}%` }}
            ></div>
          </div>
        ))}

      {/* Render actual bars */}
      {labels.map((label, i) => {
        const v = values[i];
        const heightPct = (v / max) * 100;

        return (
          <div key={label} className="flex-1 flex items-end">
            <div
              className="cyber-bar"
              title={`${label}: ${v} min`}
              style={{
                height: `${heightPct}%`,
                animationDelay: `${i * 0.08}s`,
              }}
            ></div>
          </div>
        );
      })}

      {/* Cyberpunk styling */}
      <style jsx>{`
        .neon-chart-container {
          background: transparent;
          position: relative;
        }

        /* CYBERPUNK GRADIENT BAR */
        .cyber-bar {
          width: 100%;
          border-radius: 4px;
          background: linear-gradient(to top, #ff2dfc, #00eaff);
          box-shadow:
            0 0 10px #00eaffaa,
            0 0 20px #ff2dfc99,
            inset 0 0 10px #00eaff55;
          animation: rise 0.6s ease-out forwards;
          transition: 0.2s ease;
        }

        .cyber-bar:hover {
          box-shadow:
            0 0 20px #00eaff,
            0 0 30px #ff2dfc;
          transform: scale(1.05);
        }

        /* Placeholder version (when no data) */
        .cyber-bar-placeholder {
          background: linear-gradient(to top, #1a1f2c, #293040);
          box-shadow: inset 0 0 10px #00eaff22;
        }

        /* Smooth bar appearance animation */
        @keyframes rise {
          0% {
            transform: translateY(20px) scaleY(0.2);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scaleY(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
