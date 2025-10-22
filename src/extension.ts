'use strict';
import { commands, ExtensionContext } from 'vscode';
import {
  copyPath,
  copyFolderName,
  copyFileName,
  copyFileNameWithExtension,
} from '@/functions/path';
import { foldHandler, unfoldHandler } from '@/functions/fold';
import { fileTreeGenerator } from '@/functions/file-tree';
import { openWelcome, togglePanel } from '@/functions/status-bar';
import { copyAbsolutePath, copyRelativePath } from '@/utils/path';

/**
 * 命令配置接口
 */
interface CommandConfig {
  id: string;
  handler: (...args: any[]) => any;
}

/**
 * 所有命令配置
 */
const COMMAND_CONFIGS: CommandConfig[] = [
  // 格式化文档
  {
    id: 'opened-editors.formatDocument',
    handler: () => commands.executeCommand('editor.action.formatDocument'),
  },
  // 在侧边栏中显示
  {
    id: 'opened-editors.revealSidebar',
    handler: () => commands.executeCommand('workbench.files.action.showActiveFileInExplorer'),
  },
  // 已打开的编辑器列表
  {
    id: 'opened-editors.openedEditors',
    handler: () => commands.executeCommand('workbench.action.showAllEditors'),
  },
  // 复制路径
  {
    id: 'opened-editors.copyPath',
    handler: copyPath,
  },
  // 复制文件夹名
  {
    id: 'opened-editors.copyFolderName',
    handler: copyFolderName,
  },
  // 复制文件名
  {
    id: 'opened-editors.copyFileName',
    handler: copyFileName,
  },
  // 复制文件名（含扩展名）
  {
    id: 'opened-editors.copyFileNameWithExtension',
    handler: copyFileNameWithExtension,
  },
  // 文件树生成器
  {
    id: 'opened-editors.fileTreeGenerator',
    handler: fileTreeGenerator,
  },
  // 折叠
  {
    id: 'opened-editors.fold',
    handler: foldHandler,
  },
  // 展开
  {
    id: 'opened-editors.unfold',
    handler: unfoldHandler,
  },
  // 复制绝对路径
  {
    id: 'opened-editors.copyAbsolutePath',
    handler: copyAbsolutePath,
  },
  // 复制相对路径
  {
    id: 'opened-editors.copyRelativePath',
    handler: copyRelativePath,
  },
];

/**
 * 扩展激活函数
 */
export function activate({ subscriptions }: ExtensionContext) {
  // 批量注册命令
  COMMAND_CONFIGS.forEach(({ id, handler }) => {
    subscriptions.push(commands.registerCommand(id, handler));
  });

  // 注册状态栏按钮
  togglePanel(subscriptions);
  openWelcome(subscriptions);
}

/**
 * 扩展停用函数
 */
export function deactivate() {
  // 清理工作（如果需要）
}
