'use strict';
import { commands, ExtensionContext } from 'vscode';
import { copyPath, copyFolderName, copyFileName, copyFileNameWithExtension } from './functions/path';
import { foldHandler, unfoldHandler } from './functions/fold';
import { fileTreeGenerator } from './functions/file-tree';
import { quickCaseAction, caseAction, ACTIONS, ACTION_TYPE } from './functions/copy-case';
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

  // Copy Case
  subscriptions.push(
    commands.registerCommand('copy-case.commands', () => quickCaseAction(ACTION_TYPE.copy))
  );
  subscriptions.push(
    commands.registerCommand('copy-case.constant', () => {
      caseAction(ACTIONS.constant, ACTION_TYPE.copy);
    })
  );
  subscriptions.push(
    commands.registerCommand('copy-case.camel', () => {
      caseAction(ACTIONS.camel, ACTION_TYPE.copy);
    })
  );
  subscriptions.push(
    commands.registerCommand('copy-case.pascal', () => {
      caseAction(ACTIONS.pascal, ACTION_TYPE.copy);
    })
  );
  subscriptions.push(
    commands.registerCommand('copy-case.kebab', () => {
      caseAction(ACTIONS.kebab, ACTION_TYPE.copy);
    })
  );
  subscriptions.push(
    commands.registerCommand('copy-case.snake', () => {
      caseAction(ACTIONS.snake, ACTION_TYPE.copy);
    })
  );
  subscriptions.push(
    commands.registerCommand('copy-case.dot', () => {
      caseAction(ACTIONS.dot, ACTION_TYPE.copy);
    })
  );
  subscriptions.push(
    commands.registerCommand('copy-case.path', () => {
      caseAction(ACTIONS.path, ACTION_TYPE.copy);
    })
  );
  subscriptions.push(
    commands.registerCommand('copy-case.title', () => {
      caseAction(ACTIONS.title, ACTION_TYPE.copy);
    })
  );
  subscriptions.push(
    commands.registerCommand('copy-case.lower', () => {
      caseAction(ACTIONS.lower, ACTION_TYPE.copy);
    })
  );
  subscriptions.push(
    commands.registerCommand('copy-case.upper', () => {
      caseAction(ACTIONS.upper, ACTION_TYPE.copy);
    })
  );

  // Paste Case
  subscriptions.push(
    commands.registerCommand('paste-case.commands', () => quickCaseAction(ACTION_TYPE.paste))
  );
  subscriptions.push(
    commands.registerCommand('paste-case.constant', () => {
      caseAction(ACTIONS.constant, ACTION_TYPE.paste);
    })
  );
  subscriptions.push(
    commands.registerCommand('paste-case.camel', () => {
      caseAction(ACTIONS.camel, ACTION_TYPE.paste);
    })
  );
  subscriptions.push(
    commands.registerCommand('paste-case.pascal', () => {
      caseAction(ACTIONS.pascal, ACTION_TYPE.paste);
    })
  );
  subscriptions.push(
    commands.registerCommand('paste-case.kebab', () => {
      caseAction(ACTIONS.kebab, ACTION_TYPE.paste);
    })
  );
  subscriptions.push(
    commands.registerCommand('paste-case.snake', () => {
      caseAction(ACTIONS.snake, ACTION_TYPE.paste);
    })
  );
  subscriptions.push(
    commands.registerCommand('paste-case.dot', () => {
      caseAction(ACTIONS.dot, ACTION_TYPE.paste);
    })
  );
  subscriptions.push(
    commands.registerCommand('paste-case.path', () => {
      caseAction(ACTIONS.path, ACTION_TYPE.paste);
    })
  );
  subscriptions.push(
    commands.registerCommand('paste-case.title', () => {
      caseAction(ACTIONS.title, ACTION_TYPE.paste);
    })
  );
  subscriptions.push(
    commands.registerCommand('paste-case.lower', () => {
      caseAction(ACTIONS.lower, ACTION_TYPE.paste);
    })
  );
  subscriptions.push(
    commands.registerCommand('paste-case.upper', () => {
      caseAction(ACTIONS.upper, ACTION_TYPE.paste);
    })
  );

  togglePanel(subscriptions);
  openWelcome(subscriptions);
}

export function deactivate() {
  //
}
