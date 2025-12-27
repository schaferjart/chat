import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'N8nChatPretty',
      fileName: (format) => `chat.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['animejs'],
      output: {
        globals: {
          animejs: 'anime'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css';
          return assetInfo.name || 'asset';
        }
      }
    },
    cssCodeSplit: false,
    sourcemap: true
  }
});
