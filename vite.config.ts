import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const REPOSITORY_BASE = '/IRISCODE/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? REPOSITORY_BASE : '/',
  plugins: [react()],
}))
