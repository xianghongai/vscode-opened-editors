'use strict';
import { commands, ExtensionContext } from 'vscode';

import {
  copyPath,
  copyFolderName,
  copyFileName,
  copyFileNameWithExtension,
} from './functions/path';

import { foldHandler, unfoldHandler } from './functions/fold';

import { fileTreeGenerator } from './functions/file-tree';

import {
  quickCopyCase,
  copyCase,
  ACTIONS,
} from './functions/copy-case';

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('opened-editors.formatDocument', () => {
      commands.executeCommand('editor.action.formatDocument');
    })
  );

  context.subscriptions.push(
    commands.registerCommand('opened-editors.revealSidebar', () => {
      commands.executeCommand(
        'workbench.files.action.showActiveFileInExplorer'
      );
    })
  );

  context.subscriptions.push(
    commands.registerCommand('opened-editors.openedEditors', () => {
      commands.executeCommand('workbench.action.showAllEditors');
    })
  );

  context.subscriptions.push(
    commands.registerCommand('opened-editors.copyPath', copyPath)
  );

  context.subscriptions.push(
    commands.registerCommand('opened-editors.copyFolderName', copyFolderName)
  );

  context.subscriptions.push(
    commands.registerCommand('opened-editors.copyFileName', copyFileName)
  );

  context.subscriptions.push(
    commands.registerCommand(
      'opened-editors.copyFileNameWithExtension',
      copyFileNameWithExtension
    )
  );

  context.subscriptions.push(
    commands.registerCommand(
      'opened-editors.fileTreeGenerator',
      fileTreeGenerator
    )
  );

  context.subscriptions.push(
    commands.registerCommand('opened-editors.fold', foldHandler)
  );

  context.subscriptions.push(
    commands.registerCommand('opened-editors.unfold', unfoldHandler)
  );

  // Copy Case
  context.subscriptions.push(
    commands.registerCommand('copy-case.commands', quickCopyCase)
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.constant', () => {
      copyCase(ACTIONS.constant);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.camel', () => {
      copyCase(ACTIONS.camel);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.pascal', () => {
      copyCase(ACTIONS.pascal);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.kebab', () => {
      copyCase(ACTIONS.kebab);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.snake', () => {
      copyCase(ACTIONS.snake);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.dot', () => {
      copyCase(ACTIONS.dot);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.path', () => {
      copyCase(ACTIONS.path);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.title', () => {
      copyCase(ACTIONS.title);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.lower', () => {
      copyCase(ACTIONS.lower);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.upper', () => {
      copyCase(ACTIONS.upper);
    })
  );
}

export function deactivate() {
  // window.setStatusBarMessage(
  //   '"Opened Editors" extension disabled',
  //   3000
  // );
}
