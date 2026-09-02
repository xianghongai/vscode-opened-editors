import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const resolvePath = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      // 被测模块 import 'vscode'，运行时由编辑器注入；测试里换成本地替身。
      // 以前这条靠每个测试文件各自 registerHooks 实现，现在集中在这里。
      vscode: resolvePath('./test/fixtures/vscode.ts'),
      // 与 tsconfig 的 paths 保持一致，测到用 `@/` 导入的模块时不用再改测试。
      '@': resolvePath('./src'),
    },
  },
  test: { include: ['test/**/*.test.ts'] },
});
