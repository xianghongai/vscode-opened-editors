import * as vscode from 'vscode';
import * as path from 'path';
import { getPath, copyPath, precondition } from '../../utils/path';

export const copyPathName = (...args: any) => {
  if (!precondition()) {
    return;
  }

  copyPath(args, 'path');
};

export const copyFolderName = (...args: any) => {
  if (!precondition()) {
    return;
  }

  copyPath(args, 'folder');
};

export const copyFileName = (...args: any) => {
  if (!precondition()) {
    return;
  }

  const fullPath = getPath(args);
  const extName = path.extname(fullPath);
  const fileName = path.basename(fullPath, extName);
  vscode.env.clipboard.writeText(fileName);
};

export const copyFileNameWithExtension = (...args: any) => {
  if (!precondition()) {
    return;
  }

  const fullPath = getPath(args);
  const fileName = path.basename(fullPath);
  vscode.env.clipboard.writeText(fileName);
};
