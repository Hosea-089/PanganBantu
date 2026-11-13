import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4189',
    channel: 'msedge',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: 'mobile',
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
  webServer: [
    {
      command: 'pnpm backend:dev',
      url: 'http://127.0.0.1:8000/api/v1/catalog',
      reuseExistingServer: !process.env.CI,
      env: {
        APP_ENV: 'test',
        DATABASE_URL: 'sqlite:///./panganbantu-e2e.sqlite',
        JWT_SECRET: 'e2e-only-secret-at-least-32-characters-long',
        API_PORT: '8000',
      },
    },
    {
      command: 'pnpm exec vite preview --host 127.0.0.1 --port 4189 --strictPort',
      url: 'http://127.0.0.1:4189',
      reuseExistingServer: !process.env.CI,
      env: { API_PORT: '8000' },
    },
  ],
});
