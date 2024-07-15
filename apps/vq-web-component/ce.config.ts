import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import { normalizePath } from 'vite';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
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
    }),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.resolve(__dirname, './web-components/package.json')),
          dest: normalizePath(path.resolve(__dirname, './vq-chat'))
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'vq-chat',
    lib: {
      entry: './web-components/main.ts',
      name: 'vq-chat',
      fileName: 'vq-chat'
    }
    // not necessary for now
    // rollupOptions: {
    //   input: {
    //     app: './web-components/index.html'
    //   }
    //   // output: {
    //   //   entryFileNames: 'vq-chat.[format].js',
    //   //   chunkFileNames: 'vq-chat.[name].[hash].js',
    //   //   assetFileNames: 'vq-chat.[ext]'
    //   // }
    // }
  }
});
