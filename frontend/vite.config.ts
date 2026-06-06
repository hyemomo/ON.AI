import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    host: true, // 0.0.0.0 — 핸드폰 등 외부 기기 접속 허용
    proxy: {
      "/api": "http://localhost:8000",
      "/mypage": "http://localhost:8000",
      "/auth": "http://localhost:8000",
      "/community": "http://localhost:8000",
    },
  },
});
