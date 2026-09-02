/**
 * `fileTreeGenerator` 命令处理器的行为测试。
 *
 * 与 file-tree.test.ts 分开：那份测的是 `creator()` 的遍历逻辑，这份测的是处理器
 * 对 VS Code API 的调用时序与错误处理。
 */
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, onTestFinished, test, vi } from 'vitest';

import {
  clipboardWrites,
  resetVscodeTestState,
  setClipboardWriteImplementation,
  shownErrorMessages,
  statusBarMessages,
} from './fixtures/vscode';

const { fileTreeGenerator } = await import('../src/functions/file-tree/index.ts');

beforeEach(resetVscodeTestState);

async function makeFolder(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'opened-editors-command-'));
  onTestFinished(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'file.txt'), 'content');
  return root;
}

/**
 * 接管 `console.error`，用于故意走错误分支的用例。
 *
 * 处理器在 catch 里记日志是给扩展宿主看的正常行为，但测试若放任它输出，
 * 一次全绿的运行会打印出成片的堆栈，看起来像是失败了。接管之后噪音消失，
 * 而且「确实记了日志」本身也变成了可断言的事实。
 */
function captureConsoleError() {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  onTestFinished(() => spy.mockRestore());
  return spy;
}

/**
 * 造一个挂起的剪贴板写入，并给出「写入已发起」的确定性信号。
 *
 * 不用 `setTimeout(0)` 等 `creator()` 跑完，那依赖文件系统在一个宏任务内返回，
 * 机器一忙就会假失败。
 */
function pendingClipboardWrite() {
  let finish: (() => void) | undefined;

  const started = new Promise<void>((resolveStarted) => {
    setClipboardWriteImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
          resolveStarted();
        })
    );
  });

  return { started, finish: () => finish?.() };
}

test('waits for the clipboard write before completing', async () => {
  const write = pendingClipboardWrite();
  const root = await makeFolder();

  const operation = fileTreeGenerator({ fsPath: root });

  let completed = false;
  operation.then(() => {
    completed = true;
  });

  await write.started;
  assert.deepEqual(clipboardWrites.length, 1);
  assert.equal(completed, false, 'the command must not resolve before the clipboard write does');
  assert.deepEqual(statusBarMessages, [], 'the success notice must not precede the completed write');

  write.finish();
  await operation;

  assert.equal(completed, true);
  assert.equal(statusBarMessages.length, 1);
});

test('surfaces a rejected clipboard write instead of leaking an unhandled rejection', async () => {
  const errorLog = captureConsoleError();
  setClipboardWriteImplementation(() => Promise.reject(new Error('clipboard unavailable')));

  const root = await makeFolder();

  // 未 await 时这个 rejection 会绕过处理器的 try/catch 成为 unhandled rejection，
  // 错误提示不会出现，成功提示反而会照常弹出。
  await assert.doesNotReject(() => fileTreeGenerator({ fsPath: root }));

  assert.deepEqual(shownErrorMessages, ['Failed to generate file tree: clipboard unavailable']);
  assert.deepEqual(statusBarMessages, [], 'no success notice when the write failed');
  assert.equal(errorLog.mock.calls.length, 1);
});

test('rejects a missing or malformed folder argument', async () => {
  const errorLog = captureConsoleError();

  await fileTreeGenerator(undefined);

  assert.deepEqual(clipboardWrites, [], 'nothing should reach the clipboard without a folder path');
  assert.equal(shownErrorMessages.length, 1);
  assert.equal(errorLog.mock.calls.length, 1);
});
