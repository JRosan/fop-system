import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    // Make process.env available for shared packages that need to work in both Vite and Expo
    'process.env.VITE_API_BASE_URL': JSON.stringify(
      mode === 'production' ? '/api' : 'http://localhost:5000/api'
    ),
    'process.env.EXPO_PUBLIC_API_BASE_URL': JSON.stringify(undefined),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // React and core libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Form handling
          'vendor-forms': ['react-hook-form', '@hookform/resolvers'],
          // Query and state
          'vendor-state': ['@tanstack/react-query', 'zustand'],
          // Icons (large library, separate chunk)
          'vendor-icons': ['lucide-react'],
        },
      },
    },
    // Enable source maps for debugging
    sourcemap: true,
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'react-hook-form',
      '@hookform/resolvers/zod',
      '@tanstack/react-query',
    ],
  },
}));
