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
import { openWelcome, togglePanel } from './functions/status-bar';

export function activate({ subscriptions }: ExtensionContext) {
  subscriptions.push(
    commands.registerCommand('opened-editors.formatDocument', () => {
      commands.executeCommand('editor.action.formatDocument');
    })
  );

  subscriptions.push(
    commands.registerCommand('opened-editors.revealSidebar', () => {
      commands.executeCommand(
        'workbench.files.action.showActiveFileInExplorer'
      );
    })
  );

  subscriptions.push(
    commands.registerCommand('opened-editors.openedEditors', () => {
      commands.executeCommand('workbench.action.showAllEditors');
    })
  );

  subscriptions.push(
    commands.registerCommand('opened-editors.copyPath', copyPath)
  );

  subscriptions.push(
    commands.registerCommand('opened-editors.copyFolderName', copyFolderName)
  );

  subscriptions.push(
    commands.registerCommand('opened-editors.copyFileName', copyFileName)
  );

  subscriptions.push(
    commands.registerCommand(
      'opened-editors.copyFileNameWithExtension',
      copyFileNameWithExtension
    )
  );

  subscriptions.push(
    commands.registerCommand(
      'opened-editors.fileTreeGenerator',
      fileTreeGenerator
    )
  );

  subscriptions.push(
    commands.registerCommand('opened-editors.fold', foldHandler)
  );

  subscriptions.push(
    commands.registerCommand('opened-editors.unfold', unfoldHandler)
  );

  togglePanel(subscriptions);
  openWelcome(subscriptions);
}

export function deactivate() {
  //
}
