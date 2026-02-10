import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
    // 필요하다면 경고 수치를 1000kb로 상향 (선택 사항)
    // chunkSizeWarningLimit: 1000,
  },
});
