# Repository Guidelines

## Project Structure & Module Organization

This repository contains a bundled TypeScript VS Code extension. `src/extension.ts` is the activation entry and command registry. Feature handlers live under `src/functions/<feature>/index.ts`; reusable path and file-tree logic belongs in `src/utils/`. Product icons and the Marketplace icon are stored in `art/`. English and Simplified Chinese manifest strings live in `package.nls.json` and `package.nls.zh-cn.json`. Vitest tests are under `test/`, with VS Code API doubles isolated in `test/fixtures/`; `vitest.config.mts` aliases `vscode` to that double and `@` to `src/`. `dist/` is generated and must not be edited manually.

## Build, Test, and Development Commands

- `pnpm install` installs the pinned toolchain and refreshes `pnpm-lock.yaml` when dependencies change.
- `pnpm run compile` type-checks and creates an unminified development bundle.
- `pnpm run watch` rebuilds the extension while editing.
- `pnpm test` runs the Node test suite.
- `pnpm run lint` enforces oxlint rules and `pnpm run format` / `pnpm run format:check` apply oxfmt; `pnpm run typecheck` runs strict TypeScript without emitting files.
- `pnpm run build` creates the minified production bundle.
- `pnpm run package` creates a VSIX locally; never run `publish` without explicit release authorization.

## Coding Style & Naming Conventions

Use two-space indentation, single quotes, semicolons, LF endings, and a 120-character line limit. oxfmt, EditorConfig, oxlint, and strict TypeScript define the source style. Explicit `any` is forbidden; accept uncertain external values as `unknown` and narrow them at the boundary. Use camelCase for functions and variables, PascalCase for types, and `opened-editors.<action>` for command and setting IDs.

## Testing Guidelines

Name tests `*.test.ts` and keep fixtures under `test/fixtures/`. Assertions use `node:assert/strict`; Vitest supplies the runner and module resolution, not the assertion style. Add a failing behavior test before fixing commands, filesystem traversal, configuration, or lifecycle logic. Use real temporary directories for file-tree cases and clean them with test hooks. There is no numeric coverage threshold, but every changed behavior needs a regression test. Run `pnpm test`, `pnpm run lint`, `pnpm run format:check`, and `pnpm run typecheck` before review.

## Commit & Pull Request Guidelines

History follows Conventional Commit-style prefixes such as `feat:`, `fix:`, `chore:`, `build:`, `doc:`, and `i18n:`. Keep commits focused. Pull requests should explain user impact, link relevant issues, list verification commands, and include screenshots for menus, icons, or status-bar changes. Keep `engines.vscode` aligned with the exact `@types/vscode` baseline, and verify that the `files` whitelist excludes tests, sources, credentials, and build configuration from the VSIX.
