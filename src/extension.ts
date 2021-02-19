'use strict';
import * as vscode from 'vscode';
import * as path from 'path';

const getPath = function (args: any) {
  let filePath = null;
  if (args && args.length > 0) {
    filePath = args[0].fsPath;
  }
  if (!filePath) filePath = vscode.window.activeTextEditor?.document?.fileName;
  return filePath;
};

const copyPath = (args: any, mode = 'path') => {
  let parentsPath = [];
  let lastParentPath = undefined;

  // const fsPath = vscode.window.activeTextEditor?.document.uri.fsPath ?? '';
  // path.dirname(fsPath)
  let parentPath = path.dirname(getPath(args));

  while (parentPath !== lastParentPath) {
    lastParentPath = parentPath;
    parentsPath.push(parentPath);
    parentPath = path.dirname(parentPath);
  }

  vscode.window
    .showQuickPick(parentsPath, {
      placeHolder: mode !== 'path' ? 'copy folder name:' : 'copy path name:',
    })
    .then(
      (folder: string) => {
        if (folder) {
          let _folder = folder;
          if (mode !== 'path') {
            const split = _folder.split(path.sep);
            _folder = split[split.length - 1];
          }
          vscode.env.clipboard.writeText(_folder);
        }
      },
      (reason: any) => {
        vscode.window.showErrorMessage(reason);
      }
    );
};

const precondition = () => {
  const activeTextEditor = vscode.window.activeTextEditor;

  if (!activeTextEditor) {
    return false;
  }

  let { document } = activeTextEditor;

  if (document.uri.scheme !== 'file') {
    return false;
  }

  return true;
};

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('opened-editors.revealSidebar', () => {
      vscode.commands.executeCommand(
        'workbench.files.action.showActiveFileInExplorer'
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('opened-editors.openedEditors', () => {
      vscode.commands.executeCommand('workbench.action.showAllEditors');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'opened-editors.copyPathName',
      (...args) => {
        if (!precondition()) {
          return;
        }

        copyPath(args, 'path');
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'opened-editors.copyFolderName',
      (...args) => {
        if (!precondition()) {
          return;
        }

        copyPath(args, 'folder');
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'opened-editors.copyFileName',
      (...args) => {
        if (!precondition()) {
          return;
        }

        const fullPath = getPath(args);
        const extName = path.extname(fullPath);
        const fileName = path.basename(fullPath, extName);
        vscode.env.clipboard.writeText(fileName);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'opened-editors.copyFileNameWithExtension',
      (...args) => {
        if (!precondition()) {
          return;
        }

        const fullPath = getPath(args);
        const fileName = path.basename(fullPath);
        vscode.env.clipboard.writeText(fileName);
      }
    )
  );
}

export function deactivate() {
  // vscode.window.setStatusBarMessage(
  //   '"Opened Editors" extension disabled',
  //   3000
  // );
}
