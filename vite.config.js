import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'background.js')
      },
      output: {
        entryFileNames: '[name].js',
        format: 'es'
      }
    }
  }
});