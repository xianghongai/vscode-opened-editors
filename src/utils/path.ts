import { window, env } from 'vscode';
import { dirname, sep } from 'path';

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

export const copyPath = (args: any, mode = 'path') => {
  let parentsPath = [];
  let lastParentPath = undefined;

  // const fsPath = window.activeTextEditor?.document.uri.fsPath ?? '';
  // path.dirname(fsPath)
  let parentPath = dirname(getPath(args));

  while (parentPath !== lastParentPath) {
    lastParentPath = parentPath;
    parentsPath.push(parentPath);
    parentPath = dirname(parentPath);
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
