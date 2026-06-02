import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    root: path.resolve(__dirname, 'src/renderer'),
    publicDir: 'public',
    build: {
      outDir: path.resolve(__dirname, 'dist/renderer'),
      emptyOutDir: true,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'src/renderer/index.html'),
        },
        output: {
          manualChunks: {
            phaser: ['phaser'],
          },
        },
      },
    },
    server: {
      port: 5173,
    },
  };
});
