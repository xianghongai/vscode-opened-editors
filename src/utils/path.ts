import { window, env, workspace, type WorkspaceFolder } from 'vscode';
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
 * 无活动文件时，获取工作区文件夹可复制的路径
 * @param mode 复制模式：绝对路径或文件夹名
 * @returns 要复制的路径；无文件夹、用户取消时返回 undefined
 */
async function getFallbackWorkspacePath(mode: 'absolute' | 'relative'): Promise<string | undefined> {
  const folders = workspace.workspaceFolders;

  if (!folders || folders.length === 0) {
    return undefined;
  }

  let folder: WorkspaceFolder | undefined = folders[0];

  if (folders.length > 1) {
    const selected = await window.showQuickPick(
      folders.map((candidate) => candidate.uri.fsPath),
      { placeHolder: 'select a workspace folder:' }
    );

    if (!selected) {
      return undefined;
    }

    folder = folders.find((candidate) => candidate.uri.fsPath === selected);
  }

  if (!folder) {
    return undefined;
  }

  return mode === 'absolute' ? folder.uri.fsPath : basename(folder.uri.fsPath);
}

/**
 * 复制文件的绝对路径到剪贴板；没有活动文件时复制工作区文件夹的绝对路径
 */
export const copyAbsolutePath = async (): Promise<void> => {
  const document = window.activeTextEditor?.document;

  if (document && document.uri.scheme === 'file') {
    await env.clipboard.writeText(document.fileName);
    return;
  }

  const fallbackPath = await getFallbackWorkspacePath('absolute');

  if (fallbackPath === undefined) {
    return;
  }

  await env.clipboard.writeText(fallbackPath);
};

/**
 * 复制文件的相对路径到剪贴板（相对于工作区文件夹）；没有活动文件时复制工作区文件夹名
 */
export const copyRelativePath = async (): Promise<void> => {
  const document = window.activeTextEditor?.document;

  if (document && document.uri.scheme === 'file') {
    if (!workspace.workspaceFolders) {
      return;
    }

    const folder = workspace.getWorkspaceFolder(document.uri);

    if (!folder) {
      return;
    }

    // 使用 path.relative 计算相对路径，避免跨平台问题
    await env.clipboard.writeText(relative(folder.uri.fsPath, document.fileName));
    return;
  }

  const fallbackPath = await getFallbackWorkspacePath('relative');

  if (fallbackPath === undefined) {
    return;
  }

  await env.clipboard.writeText(fallbackPath);
};
