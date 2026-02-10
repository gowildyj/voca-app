import { defineConfig } from "vite";
import react from "@vitejs/react-refresh"; // 또는 @vitejs/plugin-react

export default defineConfig({
  plugins: [react()],
  base: "/voca-app/",
});
