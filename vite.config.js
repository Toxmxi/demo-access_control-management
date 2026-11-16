import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Restrict the local prototype's browser permissions and block untrusted embeds/resources.
// Configure equivalent headers at the production web server before deployment.
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; script-src 'self'; connect-src 'self' ws:; frame-src 'self' data: blob:",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
}
// Vite's React Fast Refresh injects a small inline preamble in development only.
const devSecurityHeaders = {
  ...securityHeaders,
  'Content-Security-Policy': securityHeaders['Content-Security-Policy'].replace(
    "script-src 'self'",
    "script-src 'self' 'unsafe-inline'",
  ),
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    headers: devSecurityHeaders,
  },
  preview: {
    host: '127.0.0.1',
    headers: securityHeaders,
  },
  build: {
    rollupOptions: {
      output: {
        // แยก dependency ขนาดใหญ่เป็น chunks เพื่อให้ browser โหลดตามการใช้งาน
        manualChunks(id) {
          if (id.includes('/node_modules/lucide-react/')) return 'icons'
          if (id.includes('/node_modules/fflate/')) return 'export'
        },
      },
    },
  },
})
