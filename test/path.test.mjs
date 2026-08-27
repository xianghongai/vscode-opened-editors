import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { join, parse } from 'node:path';
import test from 'node:test';

import {
  clipboardWrites,
  resetVscodeTestState,
  setActiveTextEditor,
  setClipboardWriteImplementation,
} from './fixtures/vscode.mjs';

const vscodeModuleUrl = new URL('./fixtures/vscode.mjs', import.meta.url).href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'vscode') {
      return {
        shortCircuit: true,
        url: vscodeModuleUrl,
      };
    }

    if (specifier === '../../utils/path') {
      return nextResolve(`${specifier}.ts`, context);
    }

    return nextResolve(specifier, context);
  },
});

test.beforeEach(resetVscodeTestState);

test('ignores a non-string fsPath and falls back to the active editor', async () => {
  const { getPath } = await import('../src/utils/path.ts');
  setActiveTextEditor('/workspace/fallback.ts');

  assert.equal(getPath([{ fsPath: 42 }]), '/workspace/fallback.ts');
});

test('derives parent choices from the actual workspace root', async () => {
  const { getParentPathOptions } = await import('../src/utils/path.ts');

  assert.equal(
    typeof getParentPathOptions,
    'function',
    'the parent path derivation should be independently testable'
  );

  const workspaceRoot = join(parse(process.cwd()).root, 'Users', 'project', 'work', 'project');
  const filePath = join(workspaceRoot, 'src', 'file.ts');

  assert.deepEqual(
    getParentPathOptions(filePath, workspaceRoot),
    [join('project', 'src'), 'project']
  );
});

test('waits for the clipboard write before completing a copy command', async () => {
  let finishClipboardWrite;
  setClipboardWriteImplementation(
    () => new Promise((resolve) => {
      finishClipboardWrite = resolve;
    })
  );
  setActiveTextEditor('/workspace/example.ts');

  const { copyFileName } = await import('../src/functions/path/index.ts');
  const operation = copyFileName();

  assert.equal(typeof operation?.then, 'function');
  assert.deepEqual(clipboardWrites, ['example']);

  let completed = false;
  operation.then(() => {
    completed = true;
  });
  await Promise.resolve();
  assert.equal(completed, false);

  finishClipboardWrite();
  await operation;
  assert.equal(completed, true);
});
