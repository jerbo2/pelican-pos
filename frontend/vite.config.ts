import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    drop: ['console', 'debugger'] // Remove console.log and debugger from production
  },
  server: {
    host: true,
    port: 8000, // This is the port which we will use in docker
    // Thanks @sergiomoura for the window fix
    // add the next lines if you're using windows and hot reload doesn't work
     watch: {
       usePolling: true
     }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Return the directory name under node_modules
            return id.toString().split('node_modules/')[1].split('/')[0];
          }
        }
      }
    },
    target: "es2017"
  }
})
