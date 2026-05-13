import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // BURAYI EKLİYORSUN: GitHub repo adın neyse onu slash'lar arasına yaz
  base: '/Cs2dle/', 
})