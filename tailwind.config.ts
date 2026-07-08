import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FBFAF8",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#0C0D10", // primary text, black buttons
          2: "#3A3E48", // strong body
          3: "#5A5F6B", // body
          4: "#8A909C" // muted / metadata
        },
        line: {
          DEFAULT: "#E7E6E0", // card borders
          2: "#ECEBE6", // section rules
          3: "#F0EFEA" // inner hairlines / track
        },
        accent: {
          DEFAULT: "#4B49E6",
          hover: "#3A38C4",
          soft: "#F4F3FB"
        },
        pass: { DEFAULT: "#17915B", soft: "#EEF6F0", chart: "#4FB477" },
        warn: { DEFAULT: "#B7791F", soft: "#FBF1DE", chart: "#E7B34A" },
        // "High" risk tier — distinct orange between amber (Moderate) and red (Critical).
        high: { DEFAULT: "#B5581B", soft: "#FBEAD9", chart: "#E07B39" },
        fail: { DEFAULT: "#C0362C", soft: "#FBE9E7", chart: "#E6534B" },
        // dark-surface (#0C0D10 panels)
        onDark: { DEFAULT: "#C7CBD4", muted: "#8A909C", accent: "#8FB8FF", pass: "#8FE3B0" }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jbmono)", "monospace"]
      },
      borderRadius: {
        control: "10px", // buttons/inputs
        card: "14px",
        panel: "16px"
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,20,30,0.03)",
        float: "0 30px 60px -24px rgba(20,20,30,0.18), 0 2px 6px rgba(20,20,30,0.04)"
      },
      maxWidth: {
        marketing: "1480px",
        app: "1640px"
      },
      keyframes: {
        dot: { "0%,100%": { opacity: "0.35" }, "50%": { opacity: "1" } },
        barGrow: { from: { transform: "scaleY(0)" }, to: { transform: "scaleY(1)" } },
        indeterminate: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" }
        }
      },
      animation: {
        dot: "dot 2s infinite",
        barGrow: "barGrow 0.4s ease-out",
        indeterminate: "indeterminate 1.4s ease-in-out infinite"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
export default config;
