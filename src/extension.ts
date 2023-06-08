'use strict';
import { commands, ExtensionContext } from 'vscode';

import {
  copyPath,
  copyFolderName,
  copyFileName,
  copyFileNameWithExtension,
} from './functions/path';

import {
  foldHandler,
  unfoldHandler,
} from './functions/fold';

import { fileTreeGenerator } from './functions/file-tree';

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('opened-editors.formatDocument', () => {
      commands.executeCommand('editor.action.formatDocument');
    })
  );

  // prettier-ignore
  context.subscriptions.push(
    commands.registerCommand('opened-editors.revealSidebar', () => {
      commands.executeCommand('workbench.files.action.showActiveFileInExplorer');
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

  // prettier-ignore
  context.subscriptions.push(
    commands.registerCommand('opened-editors.copyFolderName', copyFolderName)
  );

  context.subscriptions.push(
    commands.registerCommand('opened-editors.copyFileName', copyFileName)
  );

  // prettier-ignore
  context.subscriptions.push(
    commands.registerCommand('opened-editors.copyFileNameWithExtension', copyFileNameWithExtension)
  );

  context.subscriptions.push(
    commands.registerCommand(
      'opened-editors.fileTreeGenerator',
      fileTreeGenerator
    )
  );

  // prettier-ignore
  context.subscriptions.push(
    commands.registerCommand('opened-editors.fold', foldHandler)
  );

  // prettier-ignore
  context.subscriptions.push(
    commands.registerCommand('opened-editors.unfold', unfoldHandler)
  );
}

export function deactivate() {
  // window.setStatusBarMessage(
  //   '"Opened Editors" extension disabled',
  //   3000
  // );
}
