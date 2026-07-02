import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#070A0D",
        terminal: "#0B1117",
        panel: "#101820",
        text: "#D8F3DC",
        muted: "#7D938A",
        primary: "#4ADE80",
        cyan: "#22D3EE",
        warning: "#F59E0B",
        danger: "#EF4444",
        line: "#1F342A",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "Cascadia Code", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      borderRadius: { DEFAULT: "4px", md: "4px", lg: "6px" },
      boxShadow: { panel: "0 1px 0 0 rgba(255,255,255,0.02) inset, 0 4px 16px rgba(0,0,0,0.5)" },
      keyframes: {
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.15" } },
        fadeUp: { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        ticker: { "0%,100%": { opacity: "0.35" }, "50%": { opacity: "1" } },
      },
      animation: { blink: "blink 1.1s step-end infinite", fadeUp: "fadeUp 0.2s ease-out", ticker: "ticker 1.4s ease-in-out infinite" },
    },
  },
  plugins: [],
};
export default config;
