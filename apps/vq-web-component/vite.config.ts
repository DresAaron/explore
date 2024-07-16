import { fileURLToPath, URL } from 'node:url';

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue({
      template: {
        transformAssetUrls,
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('vq-')
        }
      }
    }),
    vueDevTools(),
    // @quasar/plugin-vite options list:
    // https://github.com/quasarframework/quasar/blob/dev/vite-plugin/index.d.ts
    quasar({
      sassVariables: 'src/quasar-variables.scss'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    'process.env': loadEnv(mode, process.cwd())
  }
}));
