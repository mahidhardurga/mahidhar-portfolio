import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Generates relative asset paths so the app runs under any sub-path (like github.io/repo) or custom subdomain
});
