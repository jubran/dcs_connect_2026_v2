import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import checker from "vite-plugin-checker";

export default defineConfig({
  plugins: [
    react(),
    checker({
      overlay: {
        initialIsOpen: false,
        inheritAttrs: false,
      },
    }),
  ],

  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), "node_modules/$1"),
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), "src/$1"),
      },
    ],
  },

  server: {
    port: 3030,
    proxy: {
      "/api": {
        // target: "http://localhost:8000",
        target: 'http://192.168.68.50',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            proxyReq.path = req.originalUrl;
          });
        },
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          mui: ["@mui/material"],
        },
      },
    },
  },
  preview: {
    port: parseInt(process.env.PORT) || 8080,
  },
});
