import { window, env, workspace } from 'vscode';
import { basename, dirname, sep, isAbsolute, join, relative } from 'path';

/**
 * 从命令参数中获取文件路径
 * @param args 命令参数（可能包含 URI 对象）
 * @returns 文件路径字符串或 null
 */
export const getPath = function (args: readonly unknown[]): string | null {
  let filePath: string | null = null;

  // 从参数中获取路径
  const firstArgument = args[0];
  if (
    typeof firstArgument === 'object' &&
    firstArgument !== null &&
    'fsPath' in firstArgument &&
    typeof firstArgument.fsPath === 'string'
  ) {
    filePath = firstArgument.fsPath;
  }

  // 如果参数中没有路径，尝试从当前活动编辑器获取
  if (!filePath) {
    filePath = window.activeTextEditor?.document?.fileName || null;
  }

  return filePath;
};

/**
 * 检查前置条件：是否有可用的文件编辑器
 * @returns 是否满足条件
 */
export const precondition = (): boolean => {
  const activeTextEditor = window.activeTextEditor;

  if (!activeTextEditor) {
    return false;
  }

  const { document } = activeTextEditor;

  // 只处理文件协议的文档
  if (document.uri.scheme !== 'file') {
    return false;
  }

  return true;
};

/**
 * 获取当前文件所在的工作区文件夹路径
 * @returns 工作区文件夹路径或 null
 */
function getWorkspaceFolderPath(): string | null {
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
    return folder.uri.fsPath;
  }

  return null;
}

export function getParentPathOptions(filePath: string, workspaceRoot?: string): string[] {
  const parentPaths: string[] = [];
  let parentPath = dirname(filePath);
  let previousParent = '';

  while (parentPath !== previousParent) {
    previousParent = parentPath;
    parentPaths.push(parentPath);
    parentPath = dirname(parentPath);
  }

  if (!workspaceRoot) {
    return parentPaths;
  }

  const workspaceName = basename(workspaceRoot);
  return parentPaths.flatMap((candidate) => {
    const relativePath = relative(workspaceRoot, candidate);

    if (relativePath === '') {
      return [workspaceName];
    }

    if (relativePath === '..' || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
      return [];
    }

    return [join(workspaceName, relativePath)];
  });
}

/**
 * 显示路径选择菜单并复制选中的路径
 * @param args 命令参数
 * @param mode 复制模式：'path' 或 'folder'
 */
export const copyPath = async (args: readonly unknown[], mode: 'path' | 'folder' = 'path'): Promise<void> => {
  const filePath = getPath(args);
  if (!filePath) {
    return;
  }

  const workspaceRoot = getWorkspaceFolderPath() || undefined;
  const displayPaths = getParentPathOptions(filePath, workspaceRoot);

  try {
    const selected = await window.showQuickPick(displayPaths, {
      placeHolder: mode === 'path' ? 'copy path name:' : 'copy folder name:',
    });
    if (!selected) {
      return;
    }

    let result = selected;

    // 如果是文件夹模式，只保留最后一级目录名
    if (mode === 'folder') {
      const parts = result.split(sep);
      result = parts[parts.length - 1];
    }

    await env.clipboard.writeText(result);
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : String(reason);
    window.showErrorMessage(message);
  }
};

/**
 * 复制文件的绝对路径到剪贴板
 */
export const copyAbsolutePath = async (): Promise<void> => {
  const activeTextEditor = window.activeTextEditor;

  if (!activeTextEditor) {
    return;
  }

  const { document } = activeTextEditor;

  if (document.uri.scheme !== 'file') {
    return;
  }

  const absolutePath = document.fileName;
  await env.clipboard.writeText(absolutePath);
};

/**
 * 复制文件的相对路径到剪贴板（相对于工作区文件夹）
 */
export const copyRelativePath = async (): Promise<void> => {
  const activeTextEditor = window.activeTextEditor;

  if (!activeTextEditor) {
    return;
  }

  const { document } = activeTextEditor;

  if (document.uri.scheme !== 'file') {
    return;
  }

  if (!workspace.workspaceFolders) {
    return;
  }

  const resource = document.uri;
  const folder = workspace.getWorkspaceFolder(resource);

  if (!folder) {
    return;
  }

  const absolutePath = document.fileName;
  const workspaceFolderPath = folder.uri.fsPath;

  // 使用 path.relative 计算相对路径，避免跨平台问题
  const relativePath = relative(workspaceFolderPath, absolutePath);

  await env.clipboard.writeText(relativePath);
};
