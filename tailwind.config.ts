import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0C0A06",
          2: "#14110A",
          3: "#1D1810",
        },
        ivory: {
          DEFAULT: "#F1EAD9",
          2: "#E4DCC6",
          3: "#CFC4A8",
        },
        gold: {
          light: "#E8CF8F",
          DEFAULT: "#C9A24B",
          dark: "#A07C2C",
          deep: "#6B4E14",
        },
        leaf: "#25C06B",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "var(--font-hindi)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "var(--font-hindi)", "system-ui", "sans-serif"],
      },
      keyframes: {
        mq: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.55" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
        cueLine: {
          "0%": { transform: "translateY(-110%)" },
          "100%": { transform: "translateY(110%)" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        mq: "mq 26s linear infinite",
        "mq-slow": "mq 40s linear infinite",
        pulseRing: "pulseRing 2.6s ease-out infinite",
        "cue-line": "cueLine 1.9s ease-in-out infinite",
        floaty: "floaty 6s ease-in-out infinite",
      },
      boxShadow: {
        frame:
          "0 30px 70px -18px rgba(0, 0, 0, 0.65), 0 8px 22px -6px rgba(0, 0, 0, 0.5)",
        card: "0 16px 44px -18px rgba(0, 0, 0, 0.55)",
        soft: "0 10px 34px -14px rgba(0, 0, 0, 0.55)",
        glowgold: "0 0 44px -6px rgba(201, 162, 75, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
