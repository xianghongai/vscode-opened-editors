'use strict';
import * as vscode from 'vscode';

import {
  copyPathName,
  copyFolderName,
  copyFileName,
  copyFileNameWithExtension,
} from './modules/path';

import { fileTreeGenerator } from './modules/file-tree';

export function activate(context: vscode.ExtensionContext) {
  // prettier-ignore
  context.subscriptions.push(
    vscode.commands.registerCommand('opened-editors.revealSidebar', () => {
      vscode.commands.executeCommand('workbench.files.action.showActiveFileInExplorer');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('opened-editors.openedEditors', () => {
      vscode.commands.executeCommand('workbench.action.showAllEditors');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('opened-editors.copyPathName', copyPathName)
  );

  // prettier-ignore
  context.subscriptions.push(
    vscode.commands.registerCommand('opened-editors.copyFolderName', copyFolderName)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('opened-editors.copyFileName', copyFileName)
  );

  // prettier-ignore
  context.subscriptions.push(
    vscode.commands.registerCommand('opened-editors.copyFileNameWithExtension', copyFileNameWithExtension)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('opened-editors.fileTreeGenerator', fileTreeGenerator)
  );
}

export function deactivate() {
  // vscode.window.setStatusBarMessage(
  //   '"Opened Editors" extension disabled',
  //   3000
  // );
}
