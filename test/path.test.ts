import assert from 'node:assert/strict';
import { basename, join, parse } from 'node:path';
import { beforeEach, test } from 'vitest';

import {
  clipboardWrites,
  resetVscodeTestState,
  setActiveTextEditor,
  setClipboardWriteImplementation,
  setQuickPickResult,
  setWorkspaceFolders,
  shownQuickPickItems,
} from './fixtures/vscode';

beforeEach(resetVscodeTestState);

test('ignores a non-string fsPath and falls back to the active editor', async () => {
  const { getPath } = await import('../src/utils/path.ts');
  setActiveTextEditor('/workspace/fallback.ts');

  assert.equal(getPath([{ fsPath: 42 }]), '/workspace/fallback.ts');
});

test('derives parent choices from the actual workspace root', async () => {
  const { getParentPathOptions } = await import('../src/utils/path.ts');

  assert.equal(typeof getParentPathOptions, 'function', 'the parent path derivation should be independently testable');

  const workspaceRoot = join(parse(process.cwd()).root, 'Users', 'project', 'work', 'project');
  const filePath = join(workspaceRoot, 'src', 'file.ts');

  assert.deepEqual(getParentPathOptions(filePath, workspaceRoot), [join('project', 'src'), 'project']);
});

test('waits for the clipboard write before completing a copy command', async () => {
  let finishClipboardWrite: (() => void) | undefined;
  setClipboardWriteImplementation(
    () =>
      new Promise((resolve) => {
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

  finishClipboardWrite?.();
  await operation;
  assert.equal(completed, true);
});

test('copies the workspace folder absolute path when no editor is open', async () => {
  const folderPath = join(parse(process.cwd()).root, 'Users', 'project', 'api');
  setWorkspaceFolders([folderPath]);

  const { copyAbsolutePath } = await import('../src/utils/path.ts');
  await copyAbsolutePath();

  assert.deepEqual(clipboardWrites, [folderPath]);
  assert.deepEqual(shownQuickPickItems, [], 'a single workspace folder needs no prompt');
});

test('copies the workspace folder name as the relative path when no editor is open', async () => {
  const folderPath = join(parse(process.cwd()).root, 'Users', 'project', 'api');
  setWorkspaceFolders([folderPath]);

  const { copyRelativePath } = await import('../src/utils/path.ts');
  await copyRelativePath();

  assert.deepEqual(clipboardWrites, ['api']);
  assert.deepEqual(shownQuickPickItems, []);
});

test('asks which workspace folder to copy in a multi-root workspace', async () => {
  const firstFolder = join(parse(process.cwd()).root, 'work', 'alpha');
  const secondFolder = join(parse(process.cwd()).root, 'work', 'beta');
  setWorkspaceFolders([firstFolder, secondFolder]);
  setQuickPickResult(secondFolder);

  const { copyAbsolutePath } = await import('../src/utils/path.ts');
  await copyAbsolutePath();

  assert.deepEqual(shownQuickPickItems, [[firstFolder, secondFolder]]);
  assert.deepEqual(clipboardWrites, [secondFolder]);
});

test('copies the selected workspace folder name in a multi-root workspace', async () => {
  const firstFolder = join(parse(process.cwd()).root, 'work', 'alpha');
  const secondFolder = join(parse(process.cwd()).root, 'work', 'beta');
  setWorkspaceFolders([firstFolder, secondFolder]);
  setQuickPickResult(secondFolder);

  const { copyRelativePath } = await import('../src/utils/path.ts');
  await copyRelativePath();

  assert.deepEqual(clipboardWrites, [basename(secondFolder)]);
});

test('copies nothing when the workspace folder quick pick is cancelled', async () => {
  const firstFolder = join(parse(process.cwd()).root, 'work', 'alpha');
  const secondFolder = join(parse(process.cwd()).root, 'work', 'beta');
  setWorkspaceFolders([firstFolder, secondFolder]);

  const { copyAbsolutePath, copyRelativePath } = await import('../src/utils/path.ts');
  await copyAbsolutePath();
  await copyRelativePath();

  assert.deepEqual(clipboardWrites, []);
  assert.equal(shownQuickPickItems.length, 2, 'each command should prompt before cancelling');
});

test('keeps copying the active file absolute path', async () => {
  const folderPath = join(parse(process.cwd()).root, 'work', 'project');
  const filePath = join(folderPath, 'src', 'file.ts');
  setWorkspaceFolders([folderPath]);
  setActiveTextEditor(filePath);

  const { copyAbsolutePath } = await import('../src/utils/path.ts');
  await copyAbsolutePath();

  assert.deepEqual(clipboardWrites, [filePath]);
  assert.deepEqual(shownQuickPickItems, []);
});

test('keeps copying the active file path relative to its workspace folder', async () => {
  const folderPath = join(parse(process.cwd()).root, 'work', 'project');
  const filePath = join(folderPath, 'src', 'file.ts');
  setWorkspaceFolders([folderPath]);
  setActiveTextEditor(filePath);

  const { copyRelativePath } = await import('../src/utils/path.ts');
  await copyRelativePath();

  assert.deepEqual(clipboardWrites, [join('src', 'file.ts')]);
  assert.deepEqual(shownQuickPickItems, []);
});

test('falls back to the workspace folder when the active editor is not file-based', async () => {
  const folderPath = join(parse(process.cwd()).root, 'work', 'api');
  setWorkspaceFolders([folderPath]);
  setActiveTextEditor('Untitled-1', 'untitled');

  const { copyAbsolutePath, copyRelativePath } = await import('../src/utils/path.ts');
  await copyAbsolutePath();
  await copyRelativePath();

  assert.deepEqual(clipboardWrites, [folderPath, 'api']);
});

test('copies nothing when no workspace folder is open', async () => {
  setWorkspaceFolders([]);

  const { copyAbsolutePath, copyRelativePath } = await import('../src/utils/path.ts');
  await copyAbsolutePath();
  await copyRelativePath();

  assert.deepEqual(clipboardWrites, []);
  assert.deepEqual(shownQuickPickItems, []);
});

test('does not prompt while an active file is outside the workspace folders', async () => {
  const root = parse(process.cwd()).root;
  const folderPath = join(root, 'work', 'project');
  const outsideFile = join(root, 'other', 'file.ts');
  setWorkspaceFolders([folderPath]);
  setActiveTextEditor(outsideFile);

  const { copyAbsolutePath, copyRelativePath } = await import('../src/utils/path.ts');
  await copyAbsolutePath();
  await copyRelativePath();

  assert.deepEqual(clipboardWrites, [outsideFile]);
  assert.deepEqual(shownQuickPickItems, []);
});
