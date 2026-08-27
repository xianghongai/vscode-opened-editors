import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import test from 'node:test';

import {
  executedCommands,
  resetVscodeTestState,
  setActiveTextEditor,
  setCommandExecutionImplementation,
  setConfiguration,
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

const { foldHandler, unfoldHandler } = await import('../src/functions/fold/index.ts');

const waitForCommandContinuation = () =>
  new Promise((resolve) => setImmediate(resolve));

test.beforeEach(resetVscodeTestState);

test('maps public fold settings to VS Code commands', async () => {
  setConfiguration('opened-editors.fold', 'Level 2');
  setConfiguration('opened-editors.foldNest', false);

  const operation = foldHandler();

  assert.equal(typeof operation?.then, 'function');
  await operation;
  assert.deepEqual(executedCommands, ['editor.foldLevel2']);
});

test('applies special extension fold levels', async () => {
  setActiveTextEditor('/workspace/example.ts');
  setConfiguration('opened-editors.fold', 'All');
  setConfiguration('opened-editors.foldSpecial', { '.ts': 'Level 1' });
  setConfiguration('opened-editors.foldNest', false);

  await foldHandler();

  assert.deepEqual(executedCommands, ['editor.foldLevel1']);
});

test('awaits nested fold commands from deepest to requested level', async () => {
  const pending = [];
  setConfiguration('opened-editors.fold', 'Level 3');
  setConfiguration('opened-editors.foldNest', true);
  setCommandExecutionImplementation(
    () => new Promise((resolve) => {
      pending.push(resolve);
    })
  );

  const operation = foldHandler();
  await Promise.resolve();
  assert.deepEqual(executedCommands, ['editor.foldLevel7']);

  for (const level of [6, 5, 4, 3]) {
    pending.shift()();
    await waitForCommandContinuation();
    assert.equal(executedCommands.at(-1), `editor.foldLevel${level}`);
  }

  pending.shift()();
  await operation;
  assert.deepEqual(executedCommands, [
    'editor.foldLevel7',
    'editor.foldLevel6',
    'editor.foldLevel5',
    'editor.foldLevel4',
    'editor.foldLevel3',
  ]);
});

test('unfolds all regions through the public unfold command', async () => {
  const operation = unfoldHandler();

  assert.equal(typeof operation?.then, 'function');
  await operation;
  assert.deepEqual(executedCommands, ['editor.unfoldAll']);
});
