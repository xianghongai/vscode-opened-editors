import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/extension.ts'],
  format: ['cjs'],
  platform: 'node',
  sourcemap: true,
  external: ['vscode'],
  // 明确指定需要打包的依赖
  noExternal: ['ignore', 'tree-dump', 'fs-extra'],
  outDir: 'dist',
  clean: !options.watch,
  minify: options.minify ?? false,
  treeshake: true,
}));
