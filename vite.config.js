import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';
const { resolve } = require('path');

export default defineConfig({
    plugins: [reactRefresh()],
    build: {
        rollupOptions: {
            input: {
                App_df: resolve(__dirname, 'App-df/index.html'),
                App_sep: resolve(__dirname, 'App-sep/index.html'),
                App_linear: resolve(__dirname, 'App-linear/index.html'),
                App_logistic: resolve(__dirname, 'App-logistic/index.html'),
                App_resonance: resolve(__dirname, 'App-resonance/index.html'),
                App_sec_order: resolve(__dirname, 'App-sec-order/index.html')
            },
            output: {
                dir: 'dist'
            }
        }
    },
    optimizeDeps: {
        include: ['jotai/utils']
    },
    server: {
        watch: {
            usePolling: true
        },
        hmr: {
            protocol: 'ws',
            host: 'localhost'
        }
    }
});
