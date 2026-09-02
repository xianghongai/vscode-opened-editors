import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { beforeEach, test } from 'vitest';

import {
  createdStatusBarItems,
  emitConfigurationChange,
  resetVscodeTestState,
  setConfiguration,
} from './fixtures/vscode';

beforeEach(resetVscodeTestState);

test('registers every status-bar action through one entry point', async () => {
  const { registerStatusBarButtons } = await import('../src/functions/status-bar/index.ts');

  assert.equal(
    typeof registerStatusBarButtons,
    'function',
    'a single status-bar registration entry point should be exported'
  );

  const subscriptions: Array<{ dispose(): void }> = [];
  registerStatusBarButtons(subscriptions);

  const itemsByCommand = Object.fromEntries(createdStatusBarItems.map((item) => [item.command, item]));
  const closeWindowItem = itemsByCommand['workbench.action.closeWindow'];
  const togglePanelItem = itemsByCommand['workbench.action.togglePanel'];
  const openWelcomeItem = itemsByCommand['workbench.action.openWalkthrough'];

  assert.equal(createdStatusBarItems.length, 3);
  assert.equal(subscriptions.length, 6, 'each item and configuration listener should be disposable');
  assert.equal(closeWindowItem.id, 'opened-editors.closeWindow');
  assert.equal(togglePanelItem.id, 'opened-editors.togglePanel');
  assert.equal(openWelcomeItem.id, 'opened-editors.openWelcome');
  assert.equal(closeWindowItem.priority, 3);
  assert.equal(togglePanelItem.priority, 2);
  assert.equal(openWelcomeItem.priority, 1);
  assert.equal(closeWindowItem.visible, true);
  assert.equal(togglePanelItem.visible, true);
  assert.equal(openWelcomeItem.visible, false);
});

test('updates only the affected item and releases configuration listeners', async () => {
  const { registerStatusBarButtons } = await import('../src/functions/status-bar/index.ts');

  assert.equal(typeof registerStatusBarButtons, 'function');

  const subscriptions: Array<{ dispose(): void }> = [];
  registerStatusBarButtons(subscriptions);

  const closeWindowItem = createdStatusBarItems.find(({ command }) => command === 'workbench.action.closeWindow');
  assert.ok(closeWindowItem, 'the close-window button should have been created');

  setConfiguration('opened-editors.closeWindow', false);
  emitConfigurationChange('editor.fontSize');
  assert.equal(closeWindowItem.visible, true, 'unrelated settings should not refresh the item');

  emitConfigurationChange('opened-editors.closeWindow');
  assert.equal(closeWindowItem.visible, false);

  subscriptions.forEach((subscription) => subscription.dispose());
  setConfiguration('opened-editors.closeWindow', true);
  emitConfigurationChange('opened-editors.closeWindow');
  assert.equal(closeWindowItem.visible, false, 'disposed listeners should no longer update the item');
});

test('exposes a localized, default-on setting for the close-window action', async () => {
  const [manifest, englishMessages, chineseMessages] = await Promise.all(
    ['package.json', 'package.nls.json', 'package.nls.zh-cn.json'].map(async (file) =>
      JSON.parse(await readFile(new URL(`../${file}`, import.meta.url), 'utf8'))
    )
  );
  const messageKey = 'opened-editors.configuration.closeWindow';

  assert.deepEqual(manifest.contributes.configuration.properties['opened-editors.closeWindow'], {
    type: 'boolean',
    default: true,
    description: `%${messageKey}%`,
  });
  assert.equal(englishMessages[messageKey], 'Show the Close Window button in the status bar');
  assert.equal(chineseMessages[messageKey], '状态栏启用关闭当前窗口');
});
