'use strict';
import { commands, ExtensionContext } from 'vscode';

import {
  copyPath,
  copyFolderName,
  copyFileName,
  copyFileNameWithExtension,
} from './modules/path';

import { fileTreeGenerator } from './modules/file-tree';
import wrapSelectionHandler from './wrap/wrapSelection';

export function activate(context: ExtensionContext) {
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

  context.subscriptions.push(
    commands.registerCommand(
      'opened-editors.chinesePunctuation.singleQuote',
      wrapSelectionHandler('‘')
    )
  );

  context.subscriptions.push(
    commands.registerCommand(
      'opened-editors.chinesePunctuation.doubleQuote',
      wrapSelectionHandler('“')
    )
  );

  context.subscriptions.push(
    commands.registerCommand(
      'opened-editors.chinesePunctuation.singleGuillemet',
      wrapSelectionHandler('〈')
    )
  );

  context.subscriptions.push(
    commands.registerCommand(
      'opened-editors.chinesePunctuation.doubleGuillemet',
      wrapSelectionHandler('《')
    )
  );
}

export function deactivate() {
  // window.setStatusBarMessage(
  //   '"Opened Editors" extension disabled',
  //   3000
  // );
}
