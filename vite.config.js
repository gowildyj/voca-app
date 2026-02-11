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
  // GitHub Pages 배포 시 리포지토리 이름을 넣으세요.
  // 만약 루트 도메인이면 "/"로 수정하면 됩니다.
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
