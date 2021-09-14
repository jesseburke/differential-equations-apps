import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';
const { resolve } = require('path');

export default defineConfig({
    plugins: [reactRefresh()],
    build: {
        rollupOptions: {
            input: {
                App_df: resolve(__dirname, 'public_pages/directionFieldGrapher/index.html'),
                App_sep: resolve(__dirname, 'public_pages/sepGrapher/index.html'),
                App_linear: resolve(__dirname, 'public_pages/linearGrapher/index.html'),
                App_logistic: resolve(__dirname, 'public_pages/logisticGrapher/index.html'),
                App_resonance: resolve(__dirname, 'public_pages/resonance/index.html'),
                SecOrder: resolve(__dirname, 'public_pages/secOrderGrapher/index.html')
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
