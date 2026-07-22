import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { defineConfig } from '@vben/vite-config';

const rootDir = dirname(fileURLToPath(import.meta.url));
const requireFromWebEle = createRequire(
  resolve(rootDir, 'apps/web-ele/package.json'),
);
const elementPlusEntry = requireFromWebEle.resolve(
  'unplugin-element-plus/vite',
);
const { default: ElementPlus } = await import(
  pathToFileURL(elementPlusEntry).href
);

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      plugins: [
        ElementPlus({
          format: 'esm',
        }),
      ],
      publicDir: resolve(rootDir, 'apps/web-ele/public'),
      resolve: {
        alias: {
          '#': resolve(rootDir, 'apps/web-ele/src'),
        },
      },
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            target: 'http://localhost:5320/api',
            ws: true,
          },
        },
      },
    },
  };
});
