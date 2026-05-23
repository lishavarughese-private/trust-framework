import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals:     true,
    coverage: {
      provider:  'v8',
      reporter:  ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include:   ['server/**/*.js', 'components/**/*.jsx', 'pages/**/*.jsx'],
      exclude:   ['server/migrations/**', 'server/knexfile.js'],
    },
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './ci-reports/test-report.json',
    },
  },
});
