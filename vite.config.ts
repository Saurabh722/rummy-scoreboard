import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'rummyScoreboard',
      // Exposes the mount function and the React component for host apps
      exposes: {
        './mount': './src/mount.tsx',
        './RummyApp': './src/RummyApp.tsx',
      },
      // Shared packages — host and remote use the same copy to avoid duplicate React
      shared: ['react', 'react-dom', 'react-router-dom', '@reduxjs/toolkit', 'react-redux'],
    }),
  ],
  build: {
    // Module Federation requires ESM output
    target: 'esnext',
    // Ensure assets are properly hashed for long-term caching
    rollupOptions: {
      output: {
        // Keep the remote entry file name predictable
        entryFileNames: '[name].js',
      },
    },
  },
})

