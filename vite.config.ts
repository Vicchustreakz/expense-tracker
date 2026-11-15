import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Set base to your GitHub repo name when hosting on GitHub Pages
  // e.g. base: '/expense-tracker/'
  // Use base: '/' if deploying to Firebase Hosting or a custom domain
  base: '/',
});
