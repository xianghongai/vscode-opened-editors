import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { onTestFinished, test } from 'vitest';
import type { WorkspaceConfiguration } from 'vscode';

const { creator } = await import('../src/utils/file-tree.ts');

function getConfiguration(overrides: Record<string, unknown> = {}): WorkspaceConfiguration {
  const values = new Map([
    ['opened-editors.fileTreeExclude', ['.*']],
    ['opened-editors.fileTreeGeneratorDepth', 5],
    ['opened-editors.fileTreeExportType', 'txt'],
    ...Object.entries(overrides),
  ]);

  // creator() 只调用 get()，其余成员用不到；断言成 WorkspaceConfiguration 以免在替身里
  // 实现整套 has/inspect/update。
  return {
    get(key: string) {
      return values.get(key);
    },
  } as unknown as WorkspaceConfiguration;
}

test('lets a nested gitignore negation override a parent ignore', async () => {
  const root = await mkdtemp(join(tmpdir(), 'opened-editors-ignore-'));
  onTestFinished(() => rm(root, { recursive: true, force: true }));

  await mkdir(join(root, 'nested'));
  await writeFile(join(root, '.gitignore'), '*.txt\n');
  await writeFile(join(root, 'nested', '.gitignore'), '!keep.txt\n');
  await writeFile(join(root, 'nested', 'keep.txt'), 'keep');
  await writeFile(join(root, 'nested', 'drop.txt'), 'drop');

  const output = await creator(root, () => getConfiguration());

  assert.match(output, /keep\.txt/);
  assert.doesNotMatch(output, /drop\.txt/);
});

test('renders directory symlinks without traversing outside the selected root', async () => {
  const base = await mkdtemp(join(tmpdir(), 'opened-editors-symlink-'));
  onTestFinished(() => rm(base, { recursive: true, force: true }));

  const root = join(base, 'root');
  const outside = join(base, 'outside');
  await mkdir(root);
  await mkdir(outside);
  await writeFile(join(outside, 'outside-secret.txt'), 'outside');
  await symlink(outside, join(root, 'linked-outside'), process.platform === 'win32' ? 'junction' : 'dir');

  const output = await creator(root, () => getConfiguration({ 'opened-editors.fileTreeExclude': [] }));

  assert.match(output, /linked-outside/);
  assert.doesNotMatch(output, /outside-secret\.txt/);
});

test('stops recursing once fileTreeGeneratorDepth is reached', async () => {
  const root = await mkdtemp(join(tmpdir(), 'opened-editors-depth-'));
  onTestFinished(() => rm(root, { recursive: true, force: true }));

  await mkdir(join(root, 'level1', 'level2'), { recursive: true });
  await writeFile(join(root, 'level1', 'shallow.txt'), 'shallow');
  await writeFile(join(root, 'level1', 'level2', 'deep.txt'), 'deep');

  const output = await creator(root, () =>
    getConfiguration({ 'opened-editors.fileTreeGeneratorDepth': 2, 'opened-editors.fileTreeExclude': [] })
  );

  // depth 2 允许进入 level1（深度 1）并列出它的内容，但不再展开 level2 的内容。
  assert.match(output, /shallow\.txt/);
  assert.match(output, /level2/);
  assert.doesNotMatch(output, /deep\.txt/);
});

test('wraps the tree in a fenced block only for the markdown export type', async () => {
  const root = await mkdtemp(join(tmpdir(), 'opened-editors-export-'));
  onTestFinished(() => rm(root, { recursive: true, force: true }));

  await writeFile(join(root, 'file.txt'), 'content');

  const markdown = await creator(root, () =>
    getConfiguration({ 'opened-editors.fileTreeExportType': 'markdown', 'opened-editors.fileTreeExclude': [] })
  );
  const plain = await creator(root, () =>
    getConfiguration({ 'opened-editors.fileTreeExportType': 'txt', 'opened-editors.fileTreeExclude': [] })
  );

  assert.match(markdown, /^```\n/);
  assert.match(markdown, /```\n$/);
  assert.doesNotMatch(plain, /```/);
  assert.match(plain, /file\.txt/);
});
