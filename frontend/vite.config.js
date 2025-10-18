import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Mobile performance optimizations
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["framer-motion", "lucide-react"],
          charts: ["chart.js", "react-chartjs-2", "recharts"],
          socket: ["socket.io-client"],
        },
      },
    },
    // Optimize for mobile
    target: "es2015",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
      },
    },
    // Mobile-specific build optimizations
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Disable sourcemaps for production
  },
  // Mobile-specific optimizations
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  // Mobile-specific optimizations
  optimizeDeps: {
    include: ["react", "react-dom", "socket.io-client"],
  },
});
