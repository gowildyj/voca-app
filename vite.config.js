import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import path from "path";

// ES 모듈 환경에서 __dirname을 만드는 표준 방법
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  base: "/voca-app/",
  build: {
    rollupOptions: {
      output: {
        // 대형 라이브러리를 별도 파일로 분리하여 로딩 속도 최적화
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["framer-motion", "lucide-react"],
          "vendor-db": ["@supabase/supabase-js"],
        },
      },
    },
  },
});
