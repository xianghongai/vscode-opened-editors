import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { registerHooks } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const vscodeModuleUrl = new URL('./fixtures/vscode.mjs', import.meta.url).href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'vscode') {
      return {
        shortCircuit: true,
        url: vscodeModuleUrl,
      };
    }

    return nextResolve(specifier, context);
  },
});

const { creator } = await import('../src/utils/file-tree.ts');

function getConfiguration(overrides = {}) {
  const values = new Map([
    ['opened-editors.fileTreeExclude', ['.*']],
    ['opened-editors.fileTreeGeneratorDepth', 5],
    ['opened-editors.fileTreeExportType', 'txt'],
    ...Object.entries(overrides),
  ]);

  return {
    get(key) {
      return values.get(key);
    },
  };
}

test('lets a nested gitignore negation override a parent ignore', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'opened-editors-ignore-'));
  context.after(() => rm(root, { recursive: true, force: true }));

  await mkdir(join(root, 'nested'));
  await writeFile(join(root, '.gitignore'), '*.txt\n');
  await writeFile(join(root, 'nested', '.gitignore'), '!keep.txt\n');
  await writeFile(join(root, 'nested', 'keep.txt'), 'keep');
  await writeFile(join(root, 'nested', 'drop.txt'), 'drop');

  const output = await creator(root, () => getConfiguration());

  assert.match(output, /keep\.txt/);
  assert.doesNotMatch(output, /drop\.txt/);
});

test('renders directory symlinks without traversing outside the selected root', async (context) => {
  const base = await mkdtemp(join(tmpdir(), 'opened-editors-symlink-'));
  context.after(() => rm(base, { recursive: true, force: true }));

  const root = join(base, 'root');
  const outside = join(base, 'outside');
  await mkdir(root);
  await mkdir(outside);
  await writeFile(join(outside, 'outside-secret.txt'), 'outside');
  await symlink(
    outside,
    join(root, 'linked-outside'),
    process.platform === 'win32' ? 'junction' : 'dir'
  );

  const output = await creator(root, () =>
    getConfiguration({ 'opened-editors.fileTreeExclude': [] })
  );

  assert.match(output, /linked-outside/);
  assert.doesNotMatch(output, /outside-secret\.txt/);
});
