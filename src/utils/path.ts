import { window, env, workspace } from 'vscode';
import { basename, dirname, sep } from 'path';

export const getPath = function (args: any) {
  let filePath = null;
  if (args && args.length > 0) {
    filePath = args[0].fsPath;
  }
  if (!filePath) filePath = window.activeTextEditor?.document?.fileName;
  return filePath;
};

export const precondition = () => {
  const activeTextEditor = window.activeTextEditor;

  if (!activeTextEditor) {
    return false;
  }

  let { document } = activeTextEditor;

  if (document.uri.scheme !== 'file') {
    return false;
  }

  return true;
};

function getWorkspaceFolder() {
  let text: string | undefined;

  const editor = window.activeTextEditor;

  if (!editor || !workspace.workspaceFolders) {
    return null;
  }
  const resource = editor.document.uri;
  if (resource.scheme === 'file') {
    const folder = workspace.getWorkspaceFolder(resource);
    if (!folder) {
      return null;
    }
    return basename(folder.uri.fsPath);
  }

}

export const copyPath = (args: any, mode = 'path') => {
  let parentsPath = [];
  let lastParentPath: string = '';

  const workspaceFolder = getWorkspaceFolder();

  let parentPath = dirname(getPath(args));

  while (parentPath !== lastParentPath) {
    lastParentPath = parentPath;
    console.log('lastParentPath', lastParentPath)
    parentsPath.push(parentPath);
    parentPath = dirname(parentPath);
  }

  if (workspaceFolder) {
    parentsPath = parentsPath.reduce((previousValue, currentValue) => {
      if (currentValue.includes(workspaceFolder)) {
        previousValue.push(currentValue.substring(currentValue.indexOf(workspaceFolder)));
      }
      return previousValue;
    }, [] as string[])
  }

  window
    .showQuickPick(parentsPath, {
      placeHolder: mode !== 'path' ? 'copy folder name:' : 'copy path name:',
    })
    .then(
      (folder: any) => {
        if (folder) {
          let _folder = folder;
          if (mode !== 'path') {
            const split = _folder.split(sep);
            _folder = split[split.length - 1];
          }
          env.clipboard.writeText(_folder);
        }
      },
      (reason: any) => {
        window.showErrorMessage(reason);
      }
    );
};
