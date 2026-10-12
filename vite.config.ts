import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    assetsDir: 'bundles',
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        probe: resolve(import.meta.dirname, 'probe.html'),
      },
    },
  },
  test: {
    environment: 'node',
    include: [
      'src/**/*.test.{ts,tsx}',
      'scripts/**/*.test.ts',
      'sim/**/*.test.ts',
    ],
    allowOnly: false,
    passWithNoTests: false,
    reporters: ['default', 'junit'],
    outputFile: { junit: 'test-results/unit.xml' },
    coverage: {
      provider: 'v8',
      thresholds: { 'src/core/**': { lines: 90, branches: 85 } },
      include: [
        'sim/**/*.ts',
        'src/core/**/*.ts',
        'src/store/**/*.ts',
        'scripts/sizeBudget.ts',
        'src/ui/probe/*.ts',
      ],
      exclude: ['**/*.test.ts'],
      reporter: ['text', 'html', 'json-summary'],
      reportOnFailure: true,
    },
  },
});
