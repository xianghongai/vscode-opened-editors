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
  quickCaseAction,
  caseAction,
  ACTIONS,
  ACTION_TYPE,
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
    commands.registerCommand('copy-case.commands', () => quickCaseAction(ACTION_TYPE.copy))
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.constant', () => {
      caseAction(ACTIONS.constant, ACTION_TYPE.copy);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.camel', () => {
      caseAction(ACTIONS.camel, ACTION_TYPE.copy);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.pascal', () => {
      caseAction(ACTIONS.pascal, ACTION_TYPE.copy);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.kebab', () => {
      caseAction(ACTIONS.kebab, ACTION_TYPE.copy);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.snake', () => {
      caseAction(ACTIONS.snake, ACTION_TYPE.copy);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.dot', () => {
      caseAction(ACTIONS.dot, ACTION_TYPE.copy);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.path', () => {
      caseAction(ACTIONS.path, ACTION_TYPE.copy);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.title', () => {
      caseAction(ACTIONS.title, ACTION_TYPE.copy);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.lower', () => {
      caseAction(ACTIONS.lower, ACTION_TYPE.copy);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('copy-case.upper', () => {
      caseAction(ACTIONS.upper, ACTION_TYPE.copy);
    })
  );

  // Paste Case
  context.subscriptions.push(
    commands.registerCommand('paste-case.commands', () => quickCaseAction(ACTION_TYPE.paste))
  );
  context.subscriptions.push(
    commands.registerCommand('paste-case.constant', () => {
      caseAction(ACTIONS.constant, ACTION_TYPE.paste);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('paste-case.camel', () => {
      caseAction(ACTIONS.camel, ACTION_TYPE.paste);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('paste-case.pascal', () => {
      caseAction(ACTIONS.pascal, ACTION_TYPE.paste);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('paste-case.kebab', () => {
      caseAction(ACTIONS.kebab, ACTION_TYPE.paste);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('paste-case.snake', () => {
      caseAction(ACTIONS.snake, ACTION_TYPE.paste);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('paste-case.dot', () => {
      caseAction(ACTIONS.dot, ACTION_TYPE.paste);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('paste-case.path', () => {
      caseAction(ACTIONS.path, ACTION_TYPE.paste);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('paste-case.title', () => {
      caseAction(ACTIONS.title, ACTION_TYPE.paste);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('paste-case.lower', () => {
      caseAction(ACTIONS.lower, ACTION_TYPE.paste);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('paste-case.upper', () => {
      caseAction(ACTIONS.upper, ACTION_TYPE.paste);
    })
  );
}

export function deactivate() {
  // window.setStatusBarMessage(
  //   '"Opened Editors" extension disabled',
  //   3000
  // );
}
