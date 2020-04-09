'use strict';
import * as vscode from 'vscode';

let init = false;
let hasCpp = false;

export function activate(context: vscode.ExtensionContext) {
  let revealInSideBar = vscode.commands.registerCommand(
    'reveal.sidebar',
    () => {
      vscode.commands.executeCommand(
        'workbench.files.action.showActiveFileInExplorer'
      );
    }
  );

  let openedEditors = vscode.commands.registerCommand('opened.editors', () => {
    // let editor = vscode.window.activeTextEditor;

    // if (!editor || !editor.viewColumn) {
    //   return;
    // }

    vscode.commands.executeCommand('workbench.action.showAllEditors');
  });

  context.subscriptions.push(revealInSideBar);
  context.subscriptions.push(openedEditors);
}

export function deactivate() {
  console.log('Opened Editors extension disabled');
}
