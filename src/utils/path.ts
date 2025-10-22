import { window, env, workspace } from 'vscode';
import { basename, dirname, sep, extname, relative } from 'path';

/**
 * 从命令参数中获取文件路径
 * @param args 命令参数（可能包含 URI 对象）
 * @returns 文件路径字符串或 null
 */
export const getPath = function (args: any[]): string | null {
  let filePath: string | null = null;

  // 从参数中获取路径
  if (args && args.length > 0 && args[0]?.fsPath) {
    filePath = args[0].fsPath;
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
 * 获取当前文件所在的工作区文件夹名称
 * @returns 工作区文件夹名称或 null
 */
function getWorkspaceFolder(): string | null {
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

  return null;
}

/**
 * 显示路径选择菜单并复制选中的路径
 * @param args 命令参数
 * @param mode 复制模式：'path' 或 'folder'
 */
export const copyPath = (args: any[], mode: 'path' | 'folder' = 'path'): void => {
  const parentsPath: string[] = [];
  let lastParentPath: string = '';

  const workspaceFolder = getWorkspaceFolder();
  let parentPath = dirname(getPath(args) || '');

  // 递归获取所有父级路径
  while (parentPath !== lastParentPath) {
    lastParentPath = parentPath;
    parentsPath.push(parentPath);
    parentPath = dirname(parentPath);
  }

  // 如果存在工作区，过滤出相对于工作区的路径
  const displayPaths = workspaceFolder
    ? parentsPath
        .filter((p) => p.includes(workspaceFolder))
        .map((p) => p.substring(p.indexOf(workspaceFolder)))
    : parentsPath;

  // 显示快速选择菜单
  window
    .showQuickPick(displayPaths, {
      placeHolder: mode === 'path' ? 'copy path name:' : 'copy folder name:',
    })
    .then(
      (selected: string | undefined) => {
        if (selected) {
          let result = selected;

          // 如果是文件夹模式，只保留最后一级目录名
          if (mode === 'folder') {
            const parts = result.split(sep);
            result = parts[parts.length - 1];
          }

          env.clipboard.writeText(result);
        }
      },
      (reason: any) => {
        window.showErrorMessage(reason);
      }
    );
};

/**
 * 复制文件夹名称
 * @param args 命令参数
 */
export const copyFolderName = (...args: any[]): void => {
  if (!precondition()) {
    return;
  }

  copyPath(args, 'folder');
};

/**
 * 复制文件名（不含扩展名）
 * @param args 命令参数
 */
export const copyFileName = (...args: any[]): void => {
  if (!precondition()) {
    return;
  }

  const fullPath = getPath(args);
  if (!fullPath) {
    return;
  }

  const extName = extname(fullPath);
  const fileName = basename(fullPath, extName);
  env.clipboard.writeText(fileName);
};

/**
 * 复制文件名（含扩展名）
 * @param args 命令参数
 */
export const copyFileNameWithExtension = (...args: any[]): void => {
  if (!precondition()) {
    return;
  }

  const fullPath = getPath(args);
  if (!fullPath) {
    return;
  }

  const fileName = basename(fullPath);
  env.clipboard.writeText(fileName);
};

/**
 * 复制文件的绝对路径到剪贴板
 */
export const copyAbsolutePath = (): void => {
  const activeTextEditor = window.activeTextEditor;

  if (!activeTextEditor) {
    return;
  }

  const { document } = activeTextEditor;

  if (document.uri.scheme !== 'file') {
    return;
  }

  const absolutePath = document.fileName;
  env.clipboard.writeText(absolutePath);
};

/**
 * 复制文件的相对路径到剪贴板（相对于工作区文件夹）
 */
export const copyRelativePath = (): void => {
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

  env.clipboard.writeText(relativePath);
};
