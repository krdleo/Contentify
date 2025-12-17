import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        'dist/**',
        'node_modules/**',
        'prisma/**',
        '**/.prisma/**',
        '**/generated/**',
        '**/*.d.ts'
      ],
      all: true,
      thresholds: {
        lines: 5,
        functions: 4,
        statements: 4,
        branches: 3
      }
    }
  },
});
