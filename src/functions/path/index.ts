import { env } from 'vscode';
import { extname, basename } from 'path';
import { getPath, copyPath as copyPathHandler, precondition } from '@/utils/path';

export const copyPath = async (...args: unknown[]): Promise<void> => {
  if (!precondition()) {
    return;
  }

  await copyPathHandler(args, 'path');
};

export const copyFolderName = async (...args: unknown[]): Promise<void> => {
  if (!precondition()) {
    return;
  }

  await copyPathHandler(args, 'folder');
};

export const copyFileName = async (...args: unknown[]): Promise<void> => {
  if (!precondition()) {
    return;
  }

  const fullPath = getPath(args);
  if (!fullPath) {
    return;
  }

  const extName = extname(fullPath);
  const fileName = basename(fullPath, extName);
  await env.clipboard.writeText(fileName);
};

export const copyFileNameWithExtension = async (...args: unknown[]): Promise<void> => {
  if (!precondition()) {
    return;
  }

  const fullPath = getPath(args);
  if (!fullPath) {
    return;
  }

  const fileName = basename(fullPath);
  await env.clipboard.writeText(fileName);
};
