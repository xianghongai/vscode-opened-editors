import { env } from 'vscode';
import { extname, basename } from 'path';
import { getPath, copyPath as copyPathHandler, precondition } from '../../utils/path';

export const copyPath = (...args: any) => {
  if (!precondition()) {
    return;
  }

  copyPathHandler(args, 'path');
};

export const copyFolderName = (...args: any) => {
  if (!precondition()) {
    return;
  }

  copyPathHandler(args, 'folder');
};

export const copyFileName = (...args: any) => {
  if (!precondition()) {
    return;
  }

  const fullPath = getPath(args);
  const extName = extname(fullPath);
  const fileName = basename(fullPath, extName);
  env.clipboard.writeText(fileName);
};

export const copyFileNameWithExtension = (...args: any) => {
  if (!precondition()) {
    return;
  }

  const fullPath = getPath(args);
  const fileName = basename(fullPath);
  env.clipboard.writeText(fileName);
};
